import { Types } from "mongoose";
import { SessionModel, SessionStatus } from "../models/session.model";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { CreateUserInput } from "../validators/user.validator";
import { sessionProjection, teacherLookupStages } from "./session.service";

export const createUser = async (input: CreateUserInput) => {
  return UserModel.create(input);
};

export const getUserSessions = async (userId: string) => {
  const userExists = await UserModel.exists({ _id: userId });
  if (!userExists) {
    throw new AppError(404, "User not found");
  }

  const [result] = await SessionModel.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        status: { $in: [SessionStatus.BOOKED, SessionStatus.COMPLETED] },
      },
    },
    ...teacherLookupStages,
    { $project: sessionProjection },
    {
      $facet: {
        upcomingSessions: [
          { $match: { status: SessionStatus.BOOKED } },
          { $sort: { startTime: 1 } },
        ],
        completedSessions: [
          { $match: { status: SessionStatus.COMPLETED } },
          { $sort: { completedAt: -1 } },
        ],
      },
    },
  ]);

  return {
    upcomingSessions: result.upcomingSessions,
    completedSessions: result.completedSessions,
  };
};
