import { Document, ObjectId } from "mongoose";

interface IUser extends Document {
    name: string;
    email: string;
    category: 'basic' | 'pro' | 'premium' | 'free';
    phone: {
      personal?: number | null;
      other?: number | null;
    };
    address: {
      country?: string | null;
      addressLine?: string | null;
      pincode?: number | null;
    };
    academic: {
      branch?: string | null;
      standard?: number | null;
      schoolOrCollegeName?: string | null;
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
    documents: {
      name: string,
      url: string,
      key: string,
    }[],
    resetPasswordToken?: string | null;
    resetTokenExpiry?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getToken(): Promise<string>;
}

export default IUser;
