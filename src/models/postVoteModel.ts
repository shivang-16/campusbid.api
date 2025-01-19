import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    user: mongoose.Schema.Types.ObjectId;
    post: mongoose.Schema.Types.ObjectId;
    type: 'upvote' | 'downvote' | 'special'; // Use an enum to restrict values
}

const PostVoteSchema: Schema = new Schema<IVote>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    type: { type: String, enum: ['upvote', 'downvote', 'special'], required: true },
}, { timestamps: true });

// Indexes for efficient queries
PostVoteSchema.index({ user: 1, post: 1, type: 1 }, { unique: true });

const PostVote = mongoose.model<IVote>('PostVote', PostVoteSchema);
export default PostVote;
