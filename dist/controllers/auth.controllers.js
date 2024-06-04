"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.login = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const ms_1 = __importDefault(require("ms"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = __importDefault(require("../models/Users"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = require("../utils/catchAsync");
const sendEmail_1 = require("../utils/sendEmail");
exports.signUp = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { role, firstName, lastName, email, password, phone } = req.body;
    if (!role || !firstName || !lastName || !email || !password || !phone) {
        return next(new appError_1.default("Missing required fields.", 400));
    }
    // Check if the user already exists
    const existingUser = await Users_1.default.findOne({ email });
    if (existingUser) {
        return next(new appError_1.default("User with this email already exits.", 400));
    }
    // Hash the password
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Store user to DB
    const newUser = new Users_1.default({
        role,
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
    });
    await newUser.save();
    return res
        .status(200)
        .json({ status: "success", message: "User registered successfully." });
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default("Email and password are required.", 400));
    }
    // Find the user by email
    const user = await Users_1.default.findOne({ email });
    if (!user) {
        return next(new appError_1.default("User not found.", 400));
    }
    // Check if the password matches
    const isMatch = bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return next(new appError_1.default("Incorrect email or password.", 401));
    }
    user.password = undefined;
    // Get the JWT expiry time from environment variables
    const jwtExpiryTime = process.env.JWT_EXPIRY_TIME || "1h";
    const expiresInMilliseconds = (0, ms_1.default)(jwtExpiryTime);
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInMilliseconds / 1000;
    // Generate a JWT
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: jwtExpiryTime,
    });
    return res.send({
        status: "success",
        user,
        token,
        expiresAt: new Date(expiresAt * 1000).toISOString(),
        expiresIn: jwtExpiryTime,
    });
});
exports.requestPasswordReset = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // Get email from request body
    const { email } = req.body;
    if (!email) {
        return next(new appError_1.default("Email is required.", 400));
    }
    const user = await Users_1.default.findOne({ email });
    if (!user) {
        return next(new appError_1.default("User not found.", 400));
    }
    const token = bcrypt_1.default.genSaltSync(10); // Generate a salt as a token
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const message = `
    <p>You requested a password reset</p>
    <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
  `;
    // Send email
    await (0, sendEmail_1.sendEmail)({
        to: email,
        subject: "Password Reset",
        html: message,
    });
    // Success response
    res
        .status(200)
        .json({ status: "success", message: "Password reset email sent." });
});
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { token, password } = req.body;
    const user = await Users_1.default.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new appError_1.default("Token is invalid or has expired.", 400));
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res
        .status(200)
        .json({ status: "success", message: "Password has been reset." });
});
//# sourceMappingURL=auth.controllers.js.map