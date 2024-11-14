import mongoose from "mongoose";
import { IOptionset } from "../types/IData";

const optionsetSchema = new mongoose.Schema<IOptionset>({
    option: {
        type: String, 
        required: true
    },
    tag: {
        type: String,
        default: 'general'
    },
    type: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

export const Optionset = mongoose.model<IOptionset>('Optionset', optionsetSchema);