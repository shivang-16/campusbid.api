import mongoose, { Schema } from "mongoose";
import IUser from "../types/IUser";
import crypto from "crypto";

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    default: null,
  },
  email: { type: String, required: true, unique: true, default: null },
  category: { type: String, enum: [ 'basic', 'pro', 'premium', 'free'  ], default: "free"},
  phone: {
    personal: { type: Number, default: null },
    other: { type: Number, default: null },
  },
  address: {
    country: { type: String, default: null },
    addressLine: { type: String, default: null },
    pincode: { type: Number, default: null },
  },
  academic: {
    branch: { type: String, default: null },
    standard: { type: Number, default: null },
    schoolOrCollegeName: { type: String, default: null },
    schoolOrCollegeAddress: { type: String, default: null },
  },
  about: {
    dateOfBirth: { type: String, default: null },
    gender: { type: String, default: null },
  },
  password: { type: String, select: false, default: null },
  salt: { type: String, default: null },
  avatar: {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
  details: {
    level: { 
      number: {type: Number, default: 1} 
    },
    points: {
      number: {type: Number, default: 0} 
     },
    rating: {
      number: {type: Number, default: 0},
      updatedAt: { type: Date }
     },
  },
  badges: [
    {
      name: { type: String, default: "Beginner" },
      url: { type: String, default: "default_url" },
    },
  ],
  resetPasswordToken: { type: String, default: null },
  resetTokenExpiry: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook for email validation
userSchema.pre("save", function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error("Please enter a valid email address"));
  }
  next();
});


userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    const hashedPassword = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        candidatePassword,
        this.salt,
        1000,
        64,
        "sha512",
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString("hex"));
        },
      );
    });

    return hashedPassword === this.password;
  } catch (error) {
    throw new Error("Error comparing password.");
  }
};

userSchema.methods.getToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
