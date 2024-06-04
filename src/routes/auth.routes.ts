import express from "express";
import {
  login,
  requestPasswordReset,
  resetPassword,
  signUp,
} from "../controllers/auth.controllers";

// Express router instance
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
