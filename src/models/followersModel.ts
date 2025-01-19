import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

followerSchema.index({ userId: 1, followerId: 1 }, { unique: true });

export const Follower = mongoose.model('Follower', followerSchema);
