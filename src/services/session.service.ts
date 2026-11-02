import { env } from "../config/env";
import { SessionModel, SessionStatus } from "../models/session.model";
import { TeacherModel } from "../models/teacher.model";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { CreateSessionInput } from "../validators/session.validator";

export const sessionProjection = {
  _id: 1,
  teacherId: 1,
  userId: 1,
  startTime: 1,
  endTime: 1,
  status: 1,
  completedAt: 1,
  createdAt: 1,
  updatedAt: 1,
  "teacher._id": 1,
  "teacher.fullName": 1,
  "teacher.email": 1,
  "teacher.specialization": 1,
  "teacher.experience": 1,
};

export const teacherLookupStages = [
  {
    $lookup: {
      from: TeacherModel.collection.name,
      localField: "teacherId",
      foreignField: "_id",
      as: "teacher",
    },
  },
  { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
];

export const createSession = async (input: CreateSessionInput) => {
  const teacherExists = await TeacherModel.exists({ _id: input.teacherId });
  if (!teacherExists) {
    throw new AppError(404, "Teacher not found");
  }

  return SessionModel.create({
    teacherId: input.teacherId,
    startTime: input.startTime,
    endTime: input.endTime,
  });
};

export const getAvailableSessions = async (date: Date) => {
  const dayStart = { $dateTrunc: { date, unit: "day", timezone: env.timezone } };
  const dayEnd = {
    $dateAdd: { startDate: dayStart, unit: "day", amount: 1, timezone: env.timezone },
  };

  return SessionModel.aggregate([
    { $match: { status: SessionStatus.AVAILABLE } },
    {
      $match: {
        $expr: {
          $and: [{ $gte: ["$startTime", dayStart] }, { $lt: ["$startTime", dayEnd] }],
        },
      },
    },
    ...teacherLookupStages,
    { $sort: { startTime: 1 } },
    { $project: sessionProjection },
  ]);
};

const findSessionOrFail = async (sessionId: string) => {
  const session = await SessionModel.findById(sessionId);
  if (!session) {
    throw new AppError(404, "Session not found");
  }
  return session;
};

export const bookSession = async (sessionId: string, userId: string) => {
  const userExists = await UserModel.exists({ _id: userId });
  if (!userExists) {
    throw new AppError(404, "User not found");
  }

  const session = await findSessionOrFail(sessionId);
  if (session.status === SessionStatus.BOOKED) {
    throw new AppError(409, "Session is already booked");
  }
  if (session.status !== SessionStatus.AVAILABLE) {
    throw new AppError(409, "Only AVAILABLE sessions can be booked");
  }

  const booked = await SessionModel.findOneAndUpdate(
    { _id: sessionId, status: SessionStatus.AVAILABLE },
    { $set: { status: SessionStatus.BOOKED, userId } },
    { returnDocument: "after" },
  );
  if (!booked) {
    throw new AppError(409, "Session is already booked");
  }

  return booked;
};

export const completeSession = async (sessionId: string) => {
  const session = await findSessionOrFail(sessionId);
  if (session.status !== SessionStatus.BOOKED) {
    throw new AppError(409, "Only BOOKED sessions can be marked as completed");
  }

  const completed = await SessionModel.findOneAndUpdate(
    { _id: sessionId, status: SessionStatus.BOOKED },
    { $set: { status: SessionStatus.COMPLETED, completedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!completed) {
    throw new AppError(409, "Only BOOKED sessions can be marked as completed");
  }

  return completed;
};
