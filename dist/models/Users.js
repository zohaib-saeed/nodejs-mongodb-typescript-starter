"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    role: {
        type: String,
        required: [true, "user role required."],
        lowercase: true,
    },
    firstName: {
        type: String,
        required: [true, "first name is required."],
        lowercase: true,
    },
    lastName: {
        type: String,
        required: [true, "last name is required."],
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "email is required."],
        lowercase: true,
        unique: true,
    },
    phone: {
        type: String,
        unique: true,
        required: [true, "phone number required."],
    },
    password: {
        type: String,
        required: [true, "password is required."],
        min: [8, "password must have atleast 8 characters."],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: String,
    },
}, {
    timestamps: true,
});
const Users = mongoose_1.default.models.Users || mongoose_1.default.model("users", userSchema);
exports.default = Users;
//# sourceMappingURL=Users.js.map