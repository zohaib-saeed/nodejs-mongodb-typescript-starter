import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.models.Users || mongoose.model("users", userSchema);

export default Users;
