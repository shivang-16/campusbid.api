import mongoose from 'mongoose';

const { Schema } = mongoose;

export type IAnalytics = {
    views: number;
    upvotes: number;
    downvotes: number;
    special: number;
    engagement: number;
    [key: string]: number; // Allow indexing with a string
}

export const analyticsSchema = new Schema(
   { views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    special: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
 } );
  