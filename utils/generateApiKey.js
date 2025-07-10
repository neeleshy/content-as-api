import { randomBytes } from "crypto";

const generateApiKey = () => {
  return randomBytes(25).toString("hex"); // 50-character key
};

export default generateApiKey;