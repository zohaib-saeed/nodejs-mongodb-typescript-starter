"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const users_controllers_1 = require("../controllers/users.controllers");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.authMiddleware, users_controllers_1.getAllUsers);
router.get("/user/:userId", authMiddleware_1.authMiddleware, users_controllers_1.getUserById);
router.post("/user", authMiddleware_1.authMiddleware, users_controllers_1.addUser);
router.put("/user/:userId", authMiddleware_1.authMiddleware, users_controllers_1.updateUserById);
router.delete("/user/:userId", authMiddleware_1.authMiddleware, users_controllers_1.deleteUserById);
exports.default = router;
//# sourceMappingURL=users.routes.js.map