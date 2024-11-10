import mongoose, { Document, ObjectId } from "mongoose";
import { ISupportingDoc } from "./IProject";
import { ICity, ICollege, IState } from "./IData";

interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    role: 'client' | 'freelancer';
    mode: 'public' | 'anonymous'
    phone: {
      personal?: number | null;
      other?: number | null;
    };
    address: {
      country?: string | null;
      city: ICity,
      state: IState,
      addressLine?: string | null;
      pincode?: number | null;
    };
    academic: {
      branch?: string | null;
      standard?: number | null;
      schoolOrCollegeName?: ICollege;
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
    access_list?: [] 
    comparePassword(candidatePassword: string): Promise<boolean>;
    getToken(): Promise<string>;
}

export default IUser;
