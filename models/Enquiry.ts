import mongoose, { Schema, models } from "mongoose";

export type EnquiryStatus = "interested" | "just_a_visit" | "confused" | "product_not_available";
export type CallOutcome = "will_confirm" | "bought_other_outlet" | "bought_online" | "no_plan" | "not_received";

export interface ICallLog {
  outcome: CallOutcome;
  confirmDate?: Date;
  notes?: string;
  calledAt: Date;
  loggedBy?: mongoose.Types.ObjectId;
}

export interface IEnquiry extends mongoose.Document {
  customerName: string;
  phone: string;
  category: string;
  modelName?: string;
  reason?: string;
  status: EnquiryStatus;
  callLog: ICallLog[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CallLogSchema = new Schema<ICallLog>(
  {
    outcome: { type: String, required: true, enum: ["will_confirm", "bought_other_outlet", "bought_online", "no_plan", "not_received"] },
    confirmDate: { type: Date },
    notes: { type: String, trim: true },
    calledAt: { type: Date, default: Date.now },
    loggedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

const EnquirySchema = new Schema<IEnquiry>(
  {
    customerName: { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    category:     { type: String, required: true, trim: true },
    modelName:    { type: String, trim: true },
    reason:       { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["interested", "just_a_visit", "confused", "product_not_available"],
      default: "interested",
    },
    callLog: { type: [CallLogSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ phone: 1 });

export const Enquiry = models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
