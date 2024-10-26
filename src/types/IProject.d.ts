import { Document, ObjectId } from 'mongoose';

// Supporting Document Interface
export interface ISupportingDoc {
  fileName: string;
  fileUrl: string;
  key: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'png' | 'jpg' | 'jpeg' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'other';
  fileSize?: number; // in bytes
  uploadedAt?: Date;
}

// Bid Interface
export interface IBid {
  user: ObjectId; // Reference to the User who placed the bid
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
  };
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  postedBy: ObjectId; // Reference to the User who created the project
  bids: IBid[]; // Array of bids
  category: 'writing' | 'design' | 'development' | 'data-entry' | 'marketing';
  skillsRequired: string[];
  supportingDocs: ISupportingDoc[]; // Array of supporting documents
  createdAt?: Date;
  updatedAt?: Date;
}