
import mongoose from 'mongoose';
import { ISupportingDoc } from '../../types/IProject';

const { Schema } = mongoose;

export const SupportingDocSchema = new Schema<ISupportingDoc>(
    {
      fileName: {
        type: String,
        required: true,
        trim: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
      },
      fileSize: {
        type: Number, // in bytes
        min: 0,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    { _id: false } // _id is set to false as we don’t need unique ids for each document
  );
  