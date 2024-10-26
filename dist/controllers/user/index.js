"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePersonalInfo = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const error_1 = require("../../middlewares/error");
const processDouments_1 = require("../../helpers/processDouments");
const savePersonalInfo = async (req, res, next) => {
    try {
        const bodyData = req.body;
        const user = (await userModel_1.default.findById(req.user._id));
        if (!user) {
            return next(new error_1.CustomError('User not found', 404));
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
        if (bodyData.state) {
            user.address.state = bodyData.state;
        }
        if (bodyData.city) {
            user.address.city = bodyData.city;
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
        if (bodyData.avatar) {
            const avatar = await (0, processDouments_1.processAvatar)(bodyData.avatar);
            user.avatar = {
                url: avatar?.getUrl,
                key: avatar?.key
            };
        }
        if (bodyData.documents) {
            const docUrls = await (0, processDouments_1.processDocuments)(bodyData.documents);
            user.documents = docUrls?.map(doc => ({
                fileName: doc?.name,
                fileUrl: doc?.getUrl,
                fileSize: doc?.fileSize,
                fileType: doc?.fileType,
                key: doc?.key
            }));
        }
        user.updatedAt = new Date();
        await user.save();
        res.status(200).json({
            message: "Personal information updated successfully",
            user,
        });
    }
    catch (error) {
        console.error("Error updating personal info:", error);
        next(new error_1.CustomError(error.message));
    }
};
exports.savePersonalInfo = savePersonalInfo;
