import { z } from "zod";
import { dateInput, objectId } from "./common.validator";

export const createSessionSchema = z
  .object({
    teacherId: objectId,
    startTime: dateInput,
    endTime: dateInput,
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be greater than startTime",
    path: ["endTime"],
  });

export const availableSessionsQuerySchema = z.object({
  dateTimestamp: dateInput,
});

export const bookSessionSchema = z.object({
  userId: objectId,
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
