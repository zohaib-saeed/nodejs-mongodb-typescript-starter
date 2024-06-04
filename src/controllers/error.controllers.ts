import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

interface ExtendedError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: { message: string; path: string }[];
  code?: number;
  keyValue?: any;
  kind?: string;
  value?: any;
  path?: string;
}

function handleValidationErrorDB(err: ExtendedError) {
  const errors = Object.values(err.errors!).map(
    (el) => `${el.path}: ${el.message}`
  );
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err: ExtendedError) {
  const fields = Object.keys(err.keyValue || {});
  const message = `Duplicate field${
    fields.length > 1 ? "s" : ""
  }: ${fields.join(", ")}. Please use another value${
    fields.length > 1 ? "s" : ""
  }!`;
  return new AppError(message, 400);
}

function handleCastErrorDB(err: ExtendedError) {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

function sendErrorDev(error: ExtendedError, res: Response): Response {
  return res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message,
    stack: error.stack,
  });
}

function sendErrorProd(error: ExtendedError, res: Response): Response {
  if (error.isOperational) {
    return res.status(error.statusCode || 500).json({
      status: error.status || "error",
      message: error.message,
    });
  }

  console.error("ERROR 💥", error);

  return res.status(500).json({
    status: "error",
    message: "Something went very wrong.",
  });
}

const globalErrorHandler = (
  err: ExtendedError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.code && err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "CastError") error = handleCastErrorDB(err);

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(error, res);
  } else {
    return sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
