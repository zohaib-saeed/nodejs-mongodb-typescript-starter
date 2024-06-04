export const LogInfo = (path: string, message: string) => {
  console.log(`✅ [${path}] ${message}`);
};
export const LogError = (path: string, message: string) => {
  console.log(`❌ [${path}] ${message}`);
};
