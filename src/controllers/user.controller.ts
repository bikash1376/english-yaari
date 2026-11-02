import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { idParamSchema } from "../validators/common.validator";
import { createUserSchema } from "../validators/user.validator";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const input = createUserSchema.parse(req.body);
  const user = await userService.createUser(input);
  res.status(201).json({ success: true, data: user });
};

export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  const { id } = idParamSchema.parse(req.params);
  const sessions = await userService.getUserSessions(id);
  res.status(200).json({ success: true, data: sessions });
};
