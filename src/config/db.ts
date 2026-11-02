import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.mongodbUri);
  console.log("Connected to MongoDB");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
