import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    user: mongoose.Schema.Types.ObjectId;
    project: mongoose.Schema.Types.ObjectId;
    type: 'upvote' | 'downvote' | 'special'; // Use an enum to restrict values
}

const ProjectVoteSchema: Schema = new Schema<IVote>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    type: { type: String, enum: ['upvote', 'downvote', 'special'], required: true },
}, { timestamps: true });

// Indexes for efficient queries
ProjectVoteSchema.index({ user: 1, project: 1 }, { unique: true });

const ProjectVote = mongoose.model<IVote>('ProjectVote', ProjectVoteSchema);
export default ProjectVote;
