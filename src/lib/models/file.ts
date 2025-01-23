// lib/models/file.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  s3Url: string;
  cloudFrontUrl: string;
  category: string;
  title: string;
  description?: string;
  keywords: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
  seoSlug?: string;
  altText?: string;
  license?: string;
  contentRating?: string;
}

const FileSchema = new Schema<IFile>(
  {
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    s3Key: { type: String, required: true },
    s3Url: { type: String, required: true },
    cloudFrontUrl: { type: String, required: true },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      index: true,
    },
    keywords: [
      {
        type: String,
        index: true,
      },
    ],
    dimensions: {
      width: Number,
      height: Number,
    },
    downloads: { type: Number, default: 0 },
    seoSlug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    altText: String,
    license: {
      type: String,
      default: "Free for commercial use",
    },
    contentRating: {
      type: String,
      enum: ["G", "PG", "PG-13", "R"],
      default: "G",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for better search performance
FileSchema.index({ title: "text", description: "text", keywords: "text" });
FileSchema.index({ category: 1, fileType: 1 });
FileSchema.index({ downloads: -1 });
FileSchema.index({ createdAt: -1 });

// Generate SEO-friendly slug
FileSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.seoSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export const File =
  mongoose.models?.File || mongoose.model<IFile>("File", FileSchema);
