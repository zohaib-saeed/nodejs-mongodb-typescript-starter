"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const Log_1 = require("./Log");
const appError_1 = __importDefault(require("./appError"));
/**
 * Sends an email using the predefined transporter.
 *
 * @param options - An object containing email options (to, subject, html).
 * @returns A promise that resolves when the email is sent or rejects with an error.
 */
const sendEmail = async (options) => {
    // Define the email transport configuration for Gmail
    const transporter = nodemailer_1.default.createTransport({
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
        (0, Log_1.LogInfo)("utils.sendMail", "Email sent successfully.");
    }
    catch (error) {
        (0, Log_1.LogError)("[utils.sendMail]", error);
        throw new appError_1.default("Failed to send email.", 400);
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map