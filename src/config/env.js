import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGOOSE_URI = process.env.MONGOOSE_URI;

if (!PORT) {
  throw new Error("PORT is not available in .env");
}

if (!MONGOOSE_URI) {
  throw new Error("MONGOOSE_URI is not available in .env");
}

export default {
  PORT,
  MONGOOSE_URI,
};
