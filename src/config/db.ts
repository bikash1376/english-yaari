import mongoose from "mongoose";
import { SessionModel } from "../models/session.model";
import { TeacherModel } from "../models/teacher.model";
import { UserModel } from "../models/user.model";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.mongodbUri);
  await Promise.all([UserModel.init(), TeacherModel.init(), SessionModel.init()]);
  console.log("Connected to MongoDB");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
