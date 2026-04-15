import mongoose from "mongoose";
import env from "./env";

async function connectDB() {
  await mongoose.connect(env.MONGOOSE_URI);
  console.log("Database connected successfully");
}

export default connectDB;
