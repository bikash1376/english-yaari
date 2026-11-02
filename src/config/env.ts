import dotenv from "dotenv";

dotenv.config({ quiet: true });

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const validTimezone = (timezone: string): string => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return timezone;
  } catch {
    throw new Error(`Invalid TIMEZONE: ${timezone}`);
  }
};

export const env = {
  port: Number(process.env.PORT) || 3000,
  mongodbUri: required("MONGODB_URI"),
  timezone: validTimezone(process.env.TIMEZONE || "UTC"),
};
