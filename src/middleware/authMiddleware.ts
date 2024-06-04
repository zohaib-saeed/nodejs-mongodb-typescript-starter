import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import Users from "../models/Users";
import { IRequest } from "../types/auth.types"; // Adjust the path as necessary

export const authMiddleware = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // Get the token from the request headers
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("No token provided.", 401));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Find the user by ID
    const user = await Users.findById(decoded.userId);

    if (!user) {
      return next(new AppError("User not found.", 401));
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError("Invalid token.", 401));
  }
};
