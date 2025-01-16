import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    user: mongoose.Schema.Types.ObjectId;
    post: mongoose.Schema.Types.ObjectId;
    type: 'upvote' | 'downvote' | 'special'; // Use an enum to restrict values
}

const VoteSchema: Schema = new Schema<IVote>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    type: { type: String, enum: ['upvote', 'downvote', 'special'], required: true },
}, { timestamps: true });

// Indexes for efficient queries
VoteSchema.index({ user: 1, post: 1 }, { unique: true });

const Vote = mongoose.model<IVote>('Vote', VoteSchema);
export default Vote;
