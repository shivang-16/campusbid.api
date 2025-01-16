import mongoose, { Schema, Document } from 'mongoose';
import { SupportingDocSchema } from './helper/supportingDocModel';
import { ISupportingDoc } from '../types/IProject';

export interface IPost extends Document {
    user: mongoose.Schema.Types.ObjectId;
    text: string;
    media: ISupportingDoc[];
    analytics: {
        views: number;
        upvotes: number;
        downvotes: number;
        special: number;
        engagement: number;
    };
    isComment: {
        comment: boolean;
        post?: mongoose.Schema.Types.ObjectId;
    };
}

const PostSchema: Schema = new Schema<IPost>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
    media: { type: [SupportingDocSchema], default: [] },
    analytics: {
        views: { type: Number, default: 0 },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        special: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
    },
    isComment: {
        comment: { type: Boolean, required: true, default: false },
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    },
}, { timestamps: true });

PostSchema.index({ user: 1, createdAt: -1 });

// Pre-save hook to calculate and set the engagement
PostSchema.pre<IPost>('save', function (this: IPost, next) {
    this.analytics.engagement = this.analytics.views + this.analytics.upvotes + this.analytics.downvotes + this.analytics.special;
    next();
});

// Validation for conditional requirement of `post` when `comment` is true
PostSchema.pre<IPost>('save', function (this: IPost, next) { 
    if (this.isComment.comment && !this.isComment.post) { 
        return next(new Error('Post field is required if this document is a comment.')); 
    } 
    next(); 
});

const Post = mongoose.model<IPost>('Post', PostSchema);
export default Post;
