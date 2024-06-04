"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogError = exports.LogInfo = void 0;
const LogInfo = (path, message) => {
    console.log(`✅ [${path}] ${message}`);
};
exports.LogInfo = LogInfo;
const LogError = (path, message) => {
    console.log(`❌ [${path}] ${message}`);
};
exports.LogError = LogError;
//# sourceMappingURL=Log.js.map