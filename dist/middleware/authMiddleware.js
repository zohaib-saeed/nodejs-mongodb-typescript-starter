"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = __importDefault(require("../utils/appError"));
const Users_1 = __importDefault(require("../models/Users"));
const authMiddleware = async (req, res, next) => {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new appError_1.default("No token provided.", 401));
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Find the user by ID
        const user = await Users_1.default.findById(decoded.userId);
        if (!user) {
            return next(new appError_1.default("User not found.", 401));
        }
        // Attach user to the request object
        req.user = user;
        next();
    }
    catch (error) {
        return next(new appError_1.default("Invalid token.", 401));
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map