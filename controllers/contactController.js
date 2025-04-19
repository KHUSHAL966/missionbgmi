import Contactus from '../models/Contactus.js'; // or with correct relative path and file extension


// Submit Contact Form
export const submitContactForm = async (req, res) => {
  try {
    const { fullname, email, contactNo, message } = req.body;

    if (!fullname || !email || !contactNo || !message) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newContact = new Contactus({ fullname, email, contactNo, message });
    await newContact.save();

    res.status(201).json({ message: "Form submitted successfully!", data: newContact });
  } catch (error) {
    res.status(500).json({ error: "Server error, please try again later." });
  }
};

// Get All Messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Contactus.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};
