import mongoose from 'mongoose';
import { IProject } from '../types/IProject';
import { SupportingDocSchema } from './helper/supportingDocModel';

const { Schema, model } = mongoose;

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    budget: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed'],
      default: 'open',
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bids: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, required: true },
        message: { type: String, maxlength: 500 },
        bidDate: { type: Date, default: Date.now },
      },
    ],
    category: {
      type: String,
      enum: ['writing', 'design', 'development', 'data-entry', 'marketing'],
      required: true,
    },
    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    supportingDocs: [SupportingDocSchema], // Array of supporting documents
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Middleware to update updatedAt on each save
ProjectSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });
  

const Project = model<IProject>('Project', ProjectSchema);

export default Project;
