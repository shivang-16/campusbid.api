import { NextFunction, Request, Response } from "express";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import { CustomError } from "../../middlewares/error";

export const savePersonalInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bodyData = req.body;
    const user = (await User.findById(req.user._id)) as IUser;

    if (!user) {
      return next(new CustomError('User not found', 404))
    }

    if (bodyData.firstName) {
      user.name = bodyData.name;
    }

    if (bodyData.dateOfBirth) {
      user.about.dateOfBirth = bodyData.dateOfBirth;
    }

    if (bodyData.phone) {
      user.phone.personal = bodyData.phone;
    }

    if (bodyData.gender) {
      user.about.gender = bodyData.gender;
    }

    if (bodyData.address) {
      user.address.addressLine = bodyData.address;
    }

    if (bodyData.pinCode) {
      user.address.pincode = bodyData.pinCode;
    }

    if (bodyData.country) {
      user.address.country = bodyData.country;
    }

    if (bodyData.class) {
      user.academic.standard = bodyData.standard;
    }

    if (bodyData.branch) {
      user.academic.branch = bodyData.branch;
    }

    if (bodyData.schoolOrCollegeName) {
      user.academic.schoolOrCollegeName = bodyData.schoolOrCollegeName;
    }

    if (bodyData.schoolOrCollegeAddress) {
      user.academic.schoolOrCollegeAddress = bodyData.schoolOrCollegeAddress;
    }

    user.updatedAt = new Date()
    await user.save();

    res.status(200).json({
      message: "Personal information updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error updating personal info:", error);
    next(new CustomError(error.message))
  }
};