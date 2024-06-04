import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { catchAsync } from "../utils/catchAsync";
import { IRequest } from "../types/auth.types";
import AppError from "../utils/appError";
import Users from "../models/Users";
import mongoose from "mongoose";

export const getAllUsers = catchAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!["team_lead", "team_lead2"].includes(user.role)) {
      return next(new AppError("Invalid user role. Access not allowed.", 400));
    }

    // Get page number and page size from query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await Users.find({ isArchived: false })
      .select("role firstName lastName email phone")
      .skip(skip)
      .limit(limit);

    if (!users) {
      return next(new AppError("Users not found", 404));
    }

    // Get total count of users for pagination info
    const totalUsers = await Users.countDocuments({ isArchived: false });

    return res.status(200).json({
      status: "success",
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users,
    });
  }
);

export const addUser = catchAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!["team_lead", "team_lead2"].includes(user.role)) {
      return next(new AppError("Invalid user role. Access not allowed.", 400));
    }

    const { role, firstName, lastName, email, phone, password } = req.body;

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

    const newUser = await Users.create({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    res
      .status(200)
      .json({ status: "success", message: "User added successfully." });
  }
);

export const getUserById = catchAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (!["team_lead", "team_lead2"].includes(req.user.role)) {
      return next(new AppError("Invalid user role. Access not allowed.", 400));
    }

    const userId = req.params.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError("Either missing or invalid user ID.", 400));
    }

    const user = await Users.findById(userId).select(
      "role firstName lastName email phone"
    );

    if (!user) {
      return next(new AppError("User not found.", 400));
    }

    // Send the response
    return res.status(200).json({
      status: "success",
      user,
    });
  }
);

export const updateUserById = catchAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (!["team_lead", "team_lead2"].includes(req.user.role)) {
      return next(new AppError("Invalid user role. Access not allowed.", 400));
    }

    if (
      !req.params.userId ||
      !mongoose.Types.ObjectId.isValid(req.params.userId)
    ) {
      return next(new AppError("Either missing or invalid user ID.", 400));
    }

    try {
      let user = await Users.findById(req.params.userId);

      if (!user) {
        return next(new AppError("User not found.", 404));
      }

      Object.assign(user, req.body);

      if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
      }

      user = await user.save();

      res.status(200).json({
        status: "success",
        message: "User updated successfully.",
      });
    } catch (error) {
      next(new AppError("Error updating user.", 500));
    }
  }
);

export const deleteUserById = catchAsync(
  async (req: IRequest, res: Response, next: NextFunction) => {
    if (!["team_lead", "team_lead2"].includes(req.user.role)) {
      return next(new AppError("Invalid user role. Access not allowed.", 400));
    }

    if (
      !req.params.userId ||
      !mongoose.Types.ObjectId.isValid(req.params.userId)
    ) {
      return next(new AppError("Either missing or invalid user ID.", 400));
    }

    try {
      let user = await Users.findById(req.params.userId);

      if (!user) {
        return next(new AppError("User not found.", 404));
      }

      user.isArchived = true;

      user = await user.save();

      res.status(200).json({
        status: "success",
        message: "User deleted successfully.",
      });
    } catch (error) {
      next(new AppError("Error deleteing user.", 500));
    }
  }
);
