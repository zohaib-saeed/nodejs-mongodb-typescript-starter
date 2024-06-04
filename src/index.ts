import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { LogError, LogInfo } from "./utils/Log";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/error.controllers";
import authRouter from "./routes/auth.routes";
import usersRouter from "./routes/users.routes";

// Load environment variables
dotenv.config({ path: `${process.cwd()}/.env` });

// Configure Express app
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

// All routes here
app.get("/", async (req: Request, res: Response) => {
  res.send("App is running successfully.");
});
app.use("/v1/auth", authRouter);
app.use("/v1/users", usersRouter);

// Catch all undefined routes and handle them
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.NODE_ENV === "development"
        ? `${process.env.DB_URI_DEV}`
        : `${process.env.DB_URI_PROD}`
    );
    LogInfo("index.ts", "Connected to MongoDB.");
  } catch (error) {
    LogError("index.ts", error.message || "Error connecting to MongoDB");
  }
};

connectDB();

// Start the server
app.listen(port, () => {
  LogInfo("index.ts", `Server listening on port ${port}`);
});

export default app; // Optional for advanced usage (e.g., unit testing)
