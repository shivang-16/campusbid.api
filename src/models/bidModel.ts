import mongoose, { Schema, Document } from 'mongoose';
import { SupportingDocSchema } from './helper/supportingDocModel';
import { ISupportingDoc } from '../types/IProject';

export interface IBid extends Document {
    _id: any; 
    projectId: mongoose.Schema.Types.ObjectId; 
    user: mongoose.Schema.Types.ObjectId;  
    amount: number;                            
    proposal: string;                        
    status: 'pending' | 'accepted' | 'rejected' | 'closed'; 
    supportingDocs: ISupportingDoc[]
    createdAt: Date;
    updatedAt: Date;
}

const BidSchema: Schema = new Schema<IBid>({
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
        enum: ['pending', 'accepted', 'rejected', 'closed'],
        default: 'pending',
    },
}, { timestamps: true }); 

BidSchema.index({ user: 1, projectId: 1 }, { unique: true })

const Bid = mongoose.model<IBid>('Bid', BidSchema);
export default Bid