import { InferSchemaType, Schema, model } from "mongoose";

const teacherSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false },
);

export type Teacher = InferSchemaType<typeof teacherSchema>;

export const TeacherModel = model("Teacher", teacherSchema);
