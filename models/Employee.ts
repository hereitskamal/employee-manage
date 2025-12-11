import mongoose, { Schema, models } from "mongoose";

export interface IEmployee extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  department: string;
  title: string;        
  salary: number;
  hireDate: Date;        
  location?: string;
  age?: number;
  performance?: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String, required: true, trim: true },

    department: { type: String, required: true, trim: true },

    title: { type: String, required: true, trim: true },   // ✅ unified

    salary: { type: Number, required: true, min: 0 },

    hireDate: { type: Date, required: true },              // ✅ unified

    location: { type: String },
    age: { type: Number },
    performance: { type: Number },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      required: false,
    },
  },
  { timestamps: true }
);

export const Employee =
  models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
