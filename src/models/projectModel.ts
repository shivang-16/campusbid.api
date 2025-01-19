import mongoose from 'mongoose';
import {  IProject } from '../types/IProject';
import { SupportingDocSchema } from './helper/supportingDocModel';
import { analyticsSchema } from './helper/analyticsSchema';

const { Schema, model } = mongoose;

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      // required: true,
      // maxlength: 1000,
    },
    analytics: analyticsSchema,
    ranking: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['lineup', 'live', 'closed'],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    categories: [{
      type: String,
      trim: true,
      ref: "Optionset"
    }],
    
    files: [SupportingDocSchema], // Array of supporting documents
    
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
projectSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });
  

const Project = model<IProject>('Project', projectSchema);

export default Project;
