import Booking from '../models/Booking.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';
import User from '../models/User.js';

dotenv.config(); // Ensure environment variables are loaded

const razorpay = new Razorpay({
  key_id:process.env.RAZORPAY_KEY,
  key_secret:process.env.RAZORPAY_SECRET,
});


export const getallwinnerbooking  = async (req, res) => {
  try {
    // Fetch only winner bookings and limit fields
    const bookings = await Booking.find({ isWinner: true })
      .select("slot slotdate createdAt isWinner") // Select limited fields from Booking
      .populate({
        path: "userId",
        model: "User",
        select: "fullName  bgmiId ", // Select limited fields from User
      })
      .exec();

    // Flatten each booking and merge user details
    const filteredBookings = bookings.map((booking) => ({
      slot: booking.slot,
      slotdate:booking.slotdate,
    isWinner:booking.isWinner,
      createdAt: booking.createdAt,
      userFullName: booking.userId?.fullName || "N/A",
      userBgmiId: booking.userId?.bgmiId || "N/A",
    }));

    res.json(filteredBookings);
  } catch (err) {
    console.error("Error fetching winner bookings:", err);
    res.status(500).json({ error: "Failed to fetch winner bookings" });
  }
};


export const bookTournamentSlot = async (req, res) => {
  const { amount } = req.body;  // Amount should be in paise (1 INR = 100 paise)

  if (!amount) {
    return res.status(400).send({ error: 'Amount is required' });
  }

  try {
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `order_receipt_${Date.now()}`,
      notes: {
        key1: 'value1',
        key2: 'value2',
      },
    };

    const order = await razorpay.orders.create(options);
    res.json(order);  // Send back the order details (order_id)
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).send({ error: 'Error creating Razorpay order' });
  }
};

// Route to verify Razorpay payment
export const verify =  async (req, res) => {
  try {
      console.log("Received payment verification request:", req.body);
      
      const { paymentId, orderId, signature } = req.body;
      if (!paymentId || !orderId || !signature) {
          return res.status(400).json({ error: "Missing payment details" });
      }

      
      const secret = process.env.RAZORPAY_SECRET
      const generated_signature = crypto
          .createHmac("sha256", secret)
          .update(orderId + "|" + paymentId)
          .digest("hex");

          console.log(generated_signature)
      if (generated_signature !== signature) {
          console.error("Payment verification failed: Signature mismatch");
          return res.status(400).json({ error: "Invalid signature" });
      }

      console.log("Payment verification successful!");
      res.status(200).json({ success: true, message: "Payment verified" ,paymentId:paymentId});


  } catch (error) {
      console.error("Error in payment verification:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

// Route to save booking after payment
export const book = async (req, res) => {

  const { userId, packageId, slot, amount ,paymentStatus ,paymentId,slotdate} = req.body;

  if (!userId || !packageId || !slot || !amount ||!paymentId ||!slotdate ) {
    return res.status(400).send({ error: 'Missing required parameters' });
  }
  const formattedSlotDate = new Date(slotdate);
  const slotDate = new Date(Date.UTC(formattedSlotDate.getFullYear(), formattedSlotDate.getMonth(), formattedSlotDate.getDate(), 0, 0, 0));

  try {
    const newBooking = new Booking({
      userId,
      packageId,
      slot,
      amount,
      paymentStatus,
      paymentId ,
      slotdate: slotDate 
    });

    await newBooking.save();

    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).send({ error: 'Error creating booking' });
  }
};

export const getallbooking = async (req, res) => {
  try {
    // Extract query parameters from the request
    const { paymentStatus, slot, userId, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};

    // Apply filters conditionally
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (slot) {
      // If the slot is provided, we want to match time ranges in 30-minute intervals
      const timePattern = `^${slot}`;  // This will match the beginning part of the slot
      filter.slot = { $regex: timePattern, $options: 'i' }; // Case-insensitive match
    }

    if (userId) {
      filter.userId = userId;
    }

    if (startDate || endDate) {
      filter.slotdate = {};
      if (startDate) {
        filter.slotdate.$gte = new Date(startDate); // Greater than or equal to startDate
      }
      if (endDate) {
        filter.slotdate.$lte = new Date(endDate); // Less than or equal to endDate
      }
    }

    // Fetch bookings with applied filters
    const bookings = await Booking.find(filter)
      .populate({
        path: 'userId',
        model: 'User',
        select: 'fullName email bgmiId bgmiName whatsapp'
      })
      .exec();

    // Flatten each booking
    const flattenedBookings = bookings.map((booking) => {
      const user = booking.userId;
      return {
        ...booking.toObject(),  // Converts the Mongoose document to a plain JavaScript object
        userId: user._id,  // Add userId
        userFullName: user.fullName,
        userEmail: user.email,
        userBgmiId: user.bgmiId,
        userBgmiName: user.bgmiName,
        userWhatsapp: user.whatsapp,
      };
    });

    // Remove the nested userId field if it's no longer needed
    flattenedBookings.forEach((booking) => delete booking.userId);

    res.json(flattenedBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingsByUserId = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from request parameters
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch bookings for the given userId and sort by createdAt in ascending order
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'userId',
        model: 'User',
        select: 'fullName email bgmiId bgmiName whatsapp',
      })
      .sort({ createdAt: -1 }) // 1 for ascending order
      .exec();

    // Flatten each booking
    const flattenedBookings = bookings.map((booking) => {
      const user = booking.userId;
      return {
        ...booking.toObject(), // Converts the Mongoose document to a plain JavaScript object
        userId: user._id, // Add userId
        userFullName: user.fullName,
        userEmail: user.email,
        userBgmiId: user.bgmiId,
        userBgmiName: user.bgmiName,
        userWhatsapp: user.whatsapp,
      };
    });

    // Remove the nested userId field if it's no longer needed
    flattenedBookings.forEach((booking) => delete booking.userId);

    res.json(flattenedBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};




import { sendEmailBatch, sendSMSBatch, sendWhatsAppBatch } from '../common/notifications.js'; // Import the functions

export const getnotification = async (req, res) => {
  try {
    const { slot, date, notificationType, message } = req.body;
    const filter = {};

    // Slot Filtering
    if (slot) {
      filter.slot = slot;
    }

    // Date Filtering
    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);

      filter.slotdate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch Bookings
    const bookings = await Booking.find(filter)
      .populate({
        path: 'userId',
        model: 'User',
        select: 'fullName email whatsapp'
      })
      .exec();

    // Check if no bookings found
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for the given criteria." });
    }

    // Prepare User Details
    const users = bookings.map((booking) => {
      const user = booking.userId;
      return {
        _id: booking._id,
        userFullName: user.fullName,
        userEmail: user.email,
        userWhatsapp: user.whatsapp,
      };
    });

    // Sending Notifications Based on Type
    const emails = users.map(user => user.userEmail);
    const phoneNumbers = users.map(user => user.userWhatsapp).filter(Boolean); // Filter out undefined numbers
    const whatsappNumbers = phoneNumbers; // WhatsApp uses the same numbers

    if (notificationType === "email" || notificationType === "all") {
      await sendEmailBatch(emails, "Notification", message);
    }

    if (notificationType === "sms" || notificationType === "all") {
      await sendSMSBatch(phoneNumbers, message);
    }

    if (notificationType === "whatsapp" || notificationType === "all") {
      await sendWhatsAppBatch(whatsappNumbers, message);
    }

    res.json({ message: "Notifications sent successfully!" });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};


export const updatewinnerstatus =
async (req, res) => {
  try {
    const { id } = req.params;
    const { isWinner } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { isWinner },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Winner status updated", data: updatedBooking });
  } catch (error) {
    console.error("Error updating winner status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getsmsnotfiation = async (req, res) => {
  try {
    const { slot, date, note, roomid, roompass ,selectedPackage} = req.body;
    
    const filter = {};

    // Slot Filtering
    if (slot) {
      filter.slot = slot;
    }


    // Date Filtering
    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);

      filter.slotdate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (selectedPackage) {
      filter.amount = selectedPackage;
    }

    // Update Fields
    const updateFields = {};
    if (note) updateFields.note = note;
    if (roomid) updateFields.roomid = roomid;
    if (roompass) updateFields.roompass = roompass;

    // Perform Bulk Update
    const updateResult = await Booking.updateMany(filter, { $set: updateFields });

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ message: "No bookings found to update with the given criteria." });
    }

    res.json({
      message: "Bookings updated successfully.",
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount
    });

  } catch (err) {
    console.error('Error updating bookings:', err);
    res.status(500).json({ error: 'Failed to update bookings' });
  }
};

export const generateslot = (req, res) => {
  const tempSlots = [];
  const now = DateTime.now().setZone('Asia/Kolkata'); // Current time in IST
  const end = now.plus({ hours: 48 }); // 24-hour window

  let currentDay = now.startOf('day');

  while (currentDay < end) {
    const isToday = currentDay.hasSame(now, 'day');
    let dayStart = currentDay.set({ hour: 9, minute: 0, second: 0 });

    const dayEnd = currentDay.set({ hour: 21, minute: 0, second: 0 }); // 9:00 PM
    let slotTime;

    // If today and current time is before 9 PM
    if (isToday) {
      const roundedMinutes = now.minute % 30 === 0 ? 0 : 30 - (now.minute % 30);
      slotTime = now.plus({ minutes: roundedMinutes }).startOf('minute').set({ second: 0 });
      // If rounded slot is after 9:00 PM, skip today
      if (slotTime >= dayEnd) {
        currentDay = currentDay.plus({ days: 1 }).startOf('day');
        continue;
      }
    } else {
      slotTime = dayStart;
    }

    while (slotTime.plus({ minutes: 30 }) <= dayEnd) {
      const nextSlot = slotTime.plus({ minutes: 30 });

      tempSlots.push({
        date: slotTime.toFormat('yyyy-MM-dd'),
        timeRange: `${slotTime.toFormat('hh:mm a')} - ${nextSlot.toFormat('hh:mm a')}`,
      });

      slotTime = nextSlot;
    }

    currentDay = currentDay.plus({ days: 1 }).startOf('day');
  }

  res.status(200).json({ slots: tempSlots });
};

export const totalavailableslot = async (req, res) => {
  try {
    const { slot, date, selectedPackage } = req.query; // Use req.query for GET requests

    const filter = {};

    // Slot filter
    if (slot) {
      filter.slot = slot;
    }

    // Date filter
    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);

      filter.slotdate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Package filter
    if (selectedPackage) {
      filter.amount = Number(selectedPackage); // Make sure it's a number
    }

    const total = await Booking.countDocuments(filter); // or .find(filter) to get full list

    res.status(200).json({ total });
  } catch (err) {
    console.error("Error getting bookings:", err);
    res.status(500).json({ error: "Failed to get bookings" });
  }
};