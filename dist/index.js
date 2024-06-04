"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Log_1 = require("./utils/Log");
const appError_1 = __importDefault(require("./utils/appError"));
const error_controllers_1 = __importDefault(require("./controllers/error.controllers"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
// Load environment variables
dotenv_1.default.config({ path: `${process.cwd()}/.env` });
// Configure Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const port = process.env.PORT || 8000;
// All routes here
app.get("/", async (req, res) => {
    res.send("App is running successfully.");
});
app.use("/v1/auth", auth_routes_1.default);
app.use("/v1/users", users_routes_1.default);
// Catch all undefined routes and handle them
app.all("*", (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server.`, 404));
});
// Global error handling middleware
app.use(error_controllers_1.default);
// Database connection
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.NODE_ENV === "development"
            ? `${process.env.DB_URI_DEV}`
            : `${process.env.DB_URI_PROD}`);
        (0, Log_1.LogInfo)("index.ts", "Connected to MongoDB.");
    }
    catch (error) {
        (0, Log_1.LogError)("index.ts", error.message || "Error connecting to MongoDB");
    }
};
connectDB();
// Start the server
app.listen(port, () => {
    (0, Log_1.LogInfo)("index.ts", `Server listening on port ${port}`);
});
exports.default = app; // Optional for advanced usage (e.g., unit testing)
//# sourceMappingURL=index.js.map