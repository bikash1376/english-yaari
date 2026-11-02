import { Request, Response } from "express";
import * as teacherService from "../services/teacher.service";
import { createTeacherSchema } from "../validators/teacher.validator";

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  const input = createTeacherSchema.parse(req.body);
  const teacher = await teacherService.createTeacher(input);
  res.status(201).json({ success: true, data: teacher });
};
