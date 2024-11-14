import mongoose from 'mongoose';
import { IProject } from '../types/IProject';
import { SupportingDocSchema } from './helper/supportingDocModel';
import { citySchema, collegeSchema, stateSchema } from './helper/locationDataModels';

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
      // required: true,
      // maxlength: 1000,
    },
    budget: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: "INR"}
    },
    deadline: {
      type: Schema.Types.Mixed, 
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed'],
      default: 'open',
    },
    assignedBid: {
      type: Schema.Types.ObjectId,
      ref: "Bid"
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bid',
      },
    ],
    categories: [{
      type: String,
      trim: true,
      ref: "Optionset"
    }],
    skillsRequired: [
      {
        type: String,
        trim: true,
        ref: "Optionset"
      },
    ],
    supportingDocs: [SupportingDocSchema], // Array of supporting documents
    college: collegeSchema,
    location : {
      city: citySchema,
      state: stateSchema
    },
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
