"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.addUser = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
const Users_1 = __importDefault(require("../models/Users"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = req.user;
    if (!["team_lead", "team_lead2"].includes(user.role)) {
        return next(new appError_1.default("Invalid user role. Access not allowed.", 400));
    }
    // Get page number and page size from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const users = await Users_1.default.find({ isArchived: false })
        .select("role firstName lastName email phone")
        .skip(skip)
        .limit(limit);
    if (!users) {
        return next(new appError_1.default("Users not found", 404));
    }
    // Get total count of users for pagination info
    const totalUsers = await Users_1.default.countDocuments({ isArchived: false });
    return res.status(200).json({
        status: "success",
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        users,
    });
});
exports.addUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = req.user;
    if (!["team_lead", "team_lead2"].includes(user.role)) {
        return next(new appError_1.default("Invalid user role. Access not allowed.", 400));
    }
    const { role, firstName, lastName, email, phone, password } = req.body;
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
    const newUser = await Users_1.default.create({
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
});
exports.getUserById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!["team_lead", "team_lead2"].includes(req.user.role)) {
        return next(new appError_1.default("Invalid user role. Access not allowed.", 400));
    }
    const userId = req.params.userId;
    if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return next(new appError_1.default("Either missing or invalid user ID.", 400));
    }
    const user = await Users_1.default.findById(userId);
    if (!user) {
        return next(new appError_1.default("User not found.", 400));
    }
});
exports.updateUserById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!["team_lead", "team_lead2"].includes(req.user.role)) {
        return next(new appError_1.default("Invalid user role. Access not allowed.", 400));
    }
    if (!req.params.userId ||
        !mongoose_1.default.Types.ObjectId.isValid(req.params.userId)) {
        return next(new appError_1.default("Either missing or invalid user ID.", 400));
    }
    try {
        let user = await Users_1.default.findById(req.params.userId);
        if (!user) {
            return next(new appError_1.default("User not found.", 404));
        }
        Object.assign(user, req.body);
        if (req.body.password) {
            const hashedPassword = await bcrypt_1.default.hash(req.body.password, 10);
            user.password = hashedPassword;
        }
        user = await user.save();
        res.status(200).json({
            status: "success",
            message: "User updated successfully.",
        });
    }
    catch (error) {
        next(new appError_1.default("Error updating user.", 500));
    }
});
exports.deleteUserById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!["team_lead", "team_lead2"].includes(req.user.role)) {
        return next(new appError_1.default("Invalid user role. Access not allowed.", 400));
    }
    if (!req.params.userId ||
        !mongoose_1.default.Types.ObjectId.isValid(req.params.userId)) {
        return next(new appError_1.default("Either missing or invalid user ID.", 400));
    }
    try {
        let user = await Users_1.default.findById(req.params.userId);
        if (!user) {
            return next(new appError_1.default("User not found.", 404));
        }
        user.isArchived = true;
        user = await user.save();
        res.status(200).json({
            status: "success",
            message: "User deleted successfully.",
        });
    }
    catch (error) {
        next(new appError_1.default("Error deleteing user.", 500));
    }
});
//# sourceMappingURL=users.controllers.js.map