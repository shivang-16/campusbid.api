import mongoose, { Schema, Document } from 'mongoose';
import { SupportingDocSchema } from './helper/supportingDocModel';

export interface IBid extends Document {
    projectId: mongoose.Schema.Types.ObjectId; 
    user: mongoose.Schema.Types.ObjectId;  
    amount: number;                            
    proposal: string;                        
    status: 'pending' | 'accepted' | 'rejected'; 
    createdAt: Date;
    updatedAt: Date;
}

const BidSchema: Schema = new Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    proposal: {
        type: String,
        required: true,
        maxlength: 2000, 
    },
    supportingDocs: [SupportingDocSchema],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true }); 

BidSchema.index({ user: 1, projectId: 1 }, { unique: true })

export default mongoose.model<IBid>('Bid', BidSchema);
