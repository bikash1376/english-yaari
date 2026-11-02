import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const idParamSchema = z.object({ id: objectId });

const toDate = (value: unknown): unknown => {
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string" && value.trim() !== "") {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed) ? new Date(Number(trimmed)) : new Date(trimmed);
  }
  return value;
};

export const dateInput = z.preprocess(
  toDate,
  z.date({ error: "Must be a valid ISO date string or timestamp in milliseconds" }),
);
