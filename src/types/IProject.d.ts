import mongoose, { Document, ObjectId } from 'mongoose';
import { ICity, ICollege } from './IData';
import { IState } from 'country-state-city';
import IUser from './IUser';

// Supporting Document Interface
export interface ISupportingDoc {
  fileName: string;
  fileUrl: string;
  key: string;
  fileType?: string;
  fileSize?: number; // in bytes
  uploadedAt?: Date;
}

// Bid Interface
export interface Bids {
  user: ObjectId; 
  amount: number;
  message?: string;
  bidDate?: Date;
}

// Project Interface
export interface IProject extends Document {
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  assignedBid: mongoose.Types.ObjectId
  postedBy: ObjectId | IUser; // Reference to the User who created the project
  bids: Bids[]; // Array of bids
  categories: string[];
  skillsRequired: string[];
  supportingDocs: ISupportingDoc[]; // Array of supporting documents
  college: ICollege,
  location: {
    city: ICity,
    state: IState
  }
  createdAt?: Date;
  updatedAt?: Date;
}