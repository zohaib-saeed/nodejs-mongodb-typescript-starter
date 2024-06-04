"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
function handleValidationErrorDB(err) {
    const errors = Object.values(err.errors).map((el) => `${el.path}: ${el.message}`);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new appError_1.default(message, 400);
}
function handleDuplicateFieldsDB(err) {
    const fields = Object.keys(err.keyValue || {});
    const message = `Duplicate field${fields.length > 1 ? "s" : ""}: ${fields.join(", ")}. Please use another value${fields.length > 1 ? "s" : ""}!`;
    return new appError_1.default(message, 400);
}
function handleCastErrorDB(err) {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new appError_1.default(message, 400);
}
function sendErrorDev(error, res) {
    return res.status(error.statusCode || 500).json({
        status: error.status || "error",
        message: error.message,
        stack: error.stack,
    });
}
function sendErrorProd(error, res) {
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
const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "ValidationError")
        error = handleValidationErrorDB(err);
    if (err.code && err.code === 11000)
        error = handleDuplicateFieldsDB(err);
    if (err.name === "CastError")
        error = handleCastErrorDB(err);
    if (process.env.NODE_ENV === "development") {
        return sendErrorDev(error, res);
    }
    else {
        return sendErrorProd(error, res);
    }
};
exports.default = globalErrorHandler;
//# sourceMappingURL=error.controllers.js.map