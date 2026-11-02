import dotenv from "dotenv";

dotenv.config({ quiet: true });

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongodbUri: required("MONGODB_URI"),
  timezone: process.env.TIMEZONE || "UTC",
};
