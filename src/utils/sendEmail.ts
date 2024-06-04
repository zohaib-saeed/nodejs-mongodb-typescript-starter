import nodemailer from "nodemailer";
import { LogError, LogInfo } from "./Log";
import AppError from "./appError";

// Email options interface
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the predefined transporter.
 *
 * @param options - An object containing email options (to, subject, html).
 * @returns A promise that resolves when the email is sent or rejects with an error.
 */

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Define the email transport configuration for Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.NODEMAILER_EMAIL}`,
      pass: `${process.env.NODEMAILER_APP_PASSWORD}`,
    },
  });

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL, // Sender address
    to: options.to, // List of recipients
    subject: options.subject, // Subject line
    html: options.html, // HTML body content
  };

  try {
    await transporter.sendMail(mailOptions);
    LogInfo("utils.sendMail", "Email sent successfully.");
  } catch (error) {
    LogError("[utils.sendMail]", error);
    throw new AppError("Failed to send email.", 400);
  }
};
