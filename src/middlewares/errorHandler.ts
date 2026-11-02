import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

type ErrorBody = {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
};

const send = (res: Response, statusCode: number, body: ErrorBody): void => {
  res.status(statusCode).json(body);
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    return send(res, err.statusCode, { success: false, message: err.message });
  }

  if (err instanceof ZodError) {
    return send(res, 400, {
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return send(res, 400, {
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return send(res, 400, { success: false, message: `Invalid value for ${err.path}` });
  }

  if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue ?? {};
    const field = Object.keys(keyValue)[0] ?? "field";
    return send(res, 409, { success: false, message: `${field} already exists` });
  }

  if (typeof err === "object" && err !== null && "type" in err && err.type === "entity.parse.failed") {
    return send(res, 400, { success: false, message: "Invalid JSON body" });
  }

  console.error(err);
  send(res, 500, { success: false, message: "Internal server error" });
};
