"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controllers_1 = require("../controllers/auth.controllers");
// Express router instance
const router = express_1.default.Router();
router.post("/signup", auth_controllers_1.signUp);
router.post("/login", auth_controllers_1.login);
router.post("/request-password-reset", auth_controllers_1.requestPasswordReset);
router.post("/reset-password", auth_controllers_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map