import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const clientHTML = (req, res) => {
  const filePath = path.join(__dirname, "../index.html");
  res.sendFile(filePath);
};
