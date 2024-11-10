import mongoose from "mongoose";
import { IOptionset } from "../types/IData";

const optionsetSchema = new mongoose.Schema<IOptionset>({
    option: {
        type: String, 
        required: true
    },
    type: {
        type: String,
        required: true
    },
    values: [{
        type: String,
        required: true
    }]
});

export const Optionset = mongoose.model<IOptionset>('Optionset', optionsetSchema);