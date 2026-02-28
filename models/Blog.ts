import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  imageUrl: string;
  shortText: string;
  fullText: string;
  createdBy: string; // admin email
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema<IBlog> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    shortText: {
      type: String,
      required: [true, "Short text is required"],
      trim: true,
    },
    fullText: {
      type: String,
      required: [true, "Full text is required"],
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for sorting by creation date
BlogSchema.index({ createdAt: -1 });

const Blog: Model<IBlog> =
  (mongoose.models.Blog as Model<IBlog>) ||
  mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
