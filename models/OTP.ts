import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
  /** Stored temporarily so verify-otp can create a new user without relying on client input */
  fullName?: string;
  phone?: string;
}

const OTPSchema: Schema<IOTP> = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: undefined,
    },
    phone: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB auto-deletes expired OTP documents
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Fast lookup by email
OTPSchema.index({ email: 1 });

const OTP: Model<IOTP> =
  (mongoose.models.OTP as Model<IOTP>) ||
  mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
