import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  addUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from "../controllers/users.controllers";

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/user/:userId", authMiddleware, getUserById);
router.post("/user", authMiddleware, addUser);
router.put("/user/:userId", authMiddleware, updateUserById);
router.delete("/user/:userId", authMiddleware, deleteUserById);

export default router;
