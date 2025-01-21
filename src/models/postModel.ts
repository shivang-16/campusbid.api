import mongoose, { Schema, Document } from 'mongoose';
import { SupportingDocSchema } from './helper/supportingDocModel';
import { ISupportingDoc } from '../types/IProject';
import { IAnalytics, analyticsSchema } from './helper/analyticsSchema';

export interface IPost extends Document {
    user: mongoose.Schema.Types.ObjectId;
    text: string;
    files: ISupportingDoc[];
    analytics: IAnalytics;
    type: 'post' | 'spill';
    isComment: {
        comment: boolean;
        refPost?: mongoose.Schema.Types.ObjectId;
    };
    bgColor: string; // Added bgColor field
}

const PostSchema: Schema = new Schema<IPost>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, maxlength: 500 },
    files: { type: [SupportingDocSchema], default: [] },
    analytics: analyticsSchema,
    type: {
        type: String,
        enum: ['post', 'spill'],
        required: true,
        default: 'post',
    },
    isComment: {
        comment: { type: Boolean, required: true, default: false },
        refPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    },
    bgColor: { type: String }, // Add bgColor field to the schema
}, { timestamps: true });

PostSchema.index({ user: 1, createdAt: -1 });

// Colors array
const colorsHex = [
    "#fee2e2", "#fce7f3", "#f3e8ff", "#e0e7ff", "#ebf8ff", 
    "#e6fffa", "#f0fdf4", "#fefcbf", "#ffedd5", "#ecfeff", 
    "#f7fee7", "#fffbeb", "#fdf4ff", "#fff1f2", "#f5e6ff", 
    "#dcfce7", "#f0f9ff", "#f8fafc", "#fafaf9", "#f5f5f4"
];

// Pre-save hook to choose a random background color before saving the post
PostSchema.pre<IPost>('save', function (this: IPost, next) {
    // If the document is a comment, we do not set the bgColor
    if (!this.isComment.comment) {
        const randomColor = colorsHex[Math.floor(Math.random() * colorsHex.length)];
        this.bgColor = randomColor; // Set random bgColor
    }
    next();
});

// Validation for conditional requirement of `post` when `comment` is true
PostSchema.pre<IPost>('save', function (this: IPost, next) { 
    if (this.isComment.comment && !this.isComment.refPost) { 
        return next(new Error('Post field is required if this document is a comment.')); 
    } 
    next(); 
});

const Post = mongoose.model<IPost>('Post', PostSchema);
export default Post;
