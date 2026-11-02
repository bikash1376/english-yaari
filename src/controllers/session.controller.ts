import { Request, Response } from "express";
import * as sessionService from "../services/session.service";
import { idParamSchema } from "../validators/common.validator";
import {
  availableSessionsQuerySchema,
  bookSessionSchema,
  createSessionSchema,
} from "../validators/session.validator";

export const createSession = async (req: Request, res: Response): Promise<void> => {
  const input = createSessionSchema.parse(req.body);
  const session = await sessionService.createSession(input);
  res.status(201).json({ success: true, data: session });
};

export const getAvailableSessions = async (req: Request, res: Response): Promise<void> => {
  const { dateTimestamp } = availableSessionsQuerySchema.parse(req.query);
  const sessions = await sessionService.getAvailableSessions(dateTimestamp);
  res.status(200).json({ success: true, data: sessions });
};

export const bookSession = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParamSchema.parse(req.params);
  const { userId } = bookSessionSchema.parse(req.body ?? {});
  const session = await sessionService.bookSession(id, userId);
  res.status(200).json({ success: true, data: session });
};

export const completeSession = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParamSchema.parse(req.params);
  const session = await sessionService.completeSession(id);
  res.status(200).json({ success: true, data: session });
};
