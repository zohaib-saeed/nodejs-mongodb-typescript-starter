import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import ms from "ms";
import jwt from "jsonwebtoken";
import { ISignUpRequestBody, ISigninRequestBody } from "../types/auth.types";
import Users from "../models/Users";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { sendEmail } from "../utils/sendEmail";

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, firstName, lastName, email, password, phone } =
      req.body as ISignUpRequestBody;

    if (!role || !firstName || !lastName || !email || !password || !phone) {
      return next(new AppError("Missing required fields.", 400));
    }

    // Check if the user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return next(new AppError("User with this email already exits.", 400));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user to DB
    const newUser = new Users({
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
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ISigninRequestBody;

    if (!email || !password) {
      return next(new AppError("Email and password are required.", 400));
    }
    // Find the user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return next(new AppError("User not found.", 400));
    }

    // Check if the password matches
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Incorrect email or password.", 401));
    }

    user.password = undefined;

    // Get the JWT expiry time from environment variables
    const jwtExpiryTime = process.env.JWT_EXPIRY_TIME || "1h";
    const expiresInMilliseconds = ms(jwtExpiryTime);
    const expiresAt =
      Math.floor(Date.now() / 1000) + expiresInMilliseconds / 1000;

    // Generate a JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: jwtExpiryTime,
    });

    return res.send({
      status: "success",
      user,
      token,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      expiresIn: jwtExpiryTime,
    });
  }
);

export const requestPasswordReset = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get email from request body
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required.", 400));
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return next(new AppError("User not found.", 400));
    }

    const token = bcrypt.genSaltSync(10); // Generate a salt as a token
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const message = `
    <p>You requested a password reset</p>
    <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
  `;

    // Send email
    await sendEmail({
      to: email,
      subject: "Password Reset",
      html: message,
    });

    // Success response
    res
      .status(200)
      .json({ status: "success", message: "Password reset email sent." });
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    const user = await Users.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Password has been reset." });
  }
);
