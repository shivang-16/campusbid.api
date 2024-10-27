import { Document, ObjectId } from "mongoose";
import { ISupportingDoc } from "./IProject";

interface IUser extends Document {
    name: string;
    email: string;
    role: 'client' | 'provider';
    phone: {
      personal?: number | null;
      other?: number | null;
    };
    address: {
      country?: string | null;
      city: {},
      state: {},
      addressLine?: string | null;
      pincode?: number | null;
    };
    academic: {
      branch?: string | null;
      standard?: number | null;
      schoolOrCollegeName?: {};
      schoolOrCollegeAddress?: string | null;
    };
    about: {
      dateOfBirth?: string | null;
      gender?: string | null;
    };
    password?: string | null;
    salt?: string | null;
    avatar: {
      url: string;
      key: string;
    };
    details: {
      level: {
        number: number;
      };
      points: {
        number: number;
      };
      rating: {
        number: number;
        updatedAt?: Date;
      };
    };
    badges: {
      name?: string;
      url?: string;
    }[];
    documents: ISupportingDoc[]
    resetPasswordToken?: string | null;
    resetTokenExpiry?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getToken(): Promise<string>;
}

export default IUser;
