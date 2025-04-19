import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

// Twilio Client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Emails in Batches
 * @param {string[]} recipients - List of email addresses
 * @param {string} subject - Email subject
 * @param {string} message - Email body (supports HTML)
 * @param {number} batchSize - Number of emails per batch (default: 50)
 */
export const sendEmailBatch = async (recipients, subject, message, batchSize = 50) => {
  try {
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      await Promise.all(
        batch.map(email =>
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html: message,
          })
        )
      );

      console.log(`Sent email batch ${i / batchSize + 1}`);
    }
    console.log("All emails sent successfully");
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

/**
 * Send SMS in Batches
 * @param {string[]} phoneNumbers - List of phone numbers with country codes
 * @param {string} message - SMS text content
 * @param {number} batchSize - Number of SMS per batch (default: 20)
 */
export const sendSMSBatch = async (phoneNumbers, message, batchSize = 20) => {
  try {
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);

      await Promise.all(
        batch.map(number =>
          twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: number,
          })
        )
      );

      console.log(`Sent SMS batch ${i / batchSize + 1}`);
    }
    console.log("All SMS sent successfully");
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

/**
 * Send WhatsApp Messages in Batches
 * @param {string[]} numbers - List of WhatsApp numbers with country codes
 * @param {string} message - WhatsApp message content
 * @param {number} batchSize - Number of messages per batch (default: 20)
 */
export const sendWhatsAppBatch = async (numbers, message, batchSize = 20) => {
  try {
    for (let i = 0; i < numbers.length; i += batchSize) {
      const batch = numbers.slice(i, i + batchSize);

      await Promise.all(
        batch.map(number =>
          twilioClient.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${number}`,
          })
        )
      );

      console.log(`Sent WhatsApp batch ${i / batchSize + 1}`);
    }
    console.log("All WhatsApp messages sent successfully");
  } catch (error) {
    console.error("Error sending WhatsApp messages:", error);
  }
};
