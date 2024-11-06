import { NextFunction, Request, Response } from "express";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import { CustomError } from "../../middlewares/error";
import { processAvatar, processDocuments } from "../../helpers/processDouments";
import Bid from "../../models/bidModel";
import Project from "../../models/projectModel";

export const savePersonalInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bodyData = req.body;
    const user = (await User.findById(req.user._id)) as IUser;

    if (!user) {
      return next(new CustomError('User not found', 404))
    }

    if (bodyData.name) {
      user.name = bodyData.name;
    }

    if (bodyData.username) {
      user.username = bodyData.username;
    }

    if (bodyData.role) {
      user.role = bodyData.role;
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


    if(bodyData.avatar) {
      const avatar = await processAvatar(bodyData.avatar);
      user.avatar = {
        url: avatar?.getUrl!,
        key: avatar?.key!
      }
    }

    let docsInfo;
    if (bodyData.documents) {
      docsInfo = await processDocuments(bodyData.documents);
      const newDocuments = docsInfo?.map(doc => ({
        fileName: doc?.fileName!,
        fileUrl: doc?.getUrl!,
        fileSize: doc?.fileSize,
        fileType: doc?.fileType,
        key: doc?.key!
    }));

    // Retrieve existing documents
    const existingDocuments = user.documents || [];

    // Merge existing and new documents
    user.documents = [...existingDocuments, ...newDocuments];
    }

    user.updatedAt = new Date()
    await user.save();

    res.status(200).json({
      message: "Personal information updated successfully",
      user,
      signedUrls: docsInfo?.map(doc => doc?.putUrl)
    });
  } catch (error: any) {
    console.error("Error updating personal info:", error);
    next(new CustomError(error.message))
  }
};

export const updateUserMode = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { mode } = req.body
    const user = await User.findById(req.user._id)
    if(!user) return next(new CustomError("User not exists", 404))
    
    if(user.role !== "client") return next(new CustomError("Anonymous mode is for clients only"))

    user.mode = mode
    await user.save()

  } catch (error) {
    next(new CustomError((error as Error).message))
  }
}

export const listUserBids = async(req: Request, res: Response, next: NextFunction) => {
  try {

      const { status } = req.query

      const query: any = {user: req.user._id}
      
      if(status) query.status = status
      
      console.log(query)

      const bids = await Bid.find(query).populate({
        path: "projectId",  
        select: "title _id", 
    })
      
      res.status(200).json({
        success: true,
        bids
      })

  } catch (error) {
    next(new CustomError((error as Error).message))
  }
}

export const listUsersProjects = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query

      const query: any = {postedBy: req.user._id}
      
      if(status) query.status = status

      console.log(query, "her eis qyer", req.user._id)

      const projects = await Project.find(query)
      
      console.log(projects, "here")
      res.status(200).json({
        success: true,
        projects
      })  
    
    } catch (error) {
    next(new CustomError((error as Error).message))
  }
}

// this controller is for freelancer route
export const listFreelancerAssignedProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    // Find all bids by the user
    const bids = await Bid.find({ user: req.user._id });

    // Extract project IDs from the bids
    const projectIds = bids.map(bid => bid.projectId);

    // Find projects based on the extracted project IDs and optional status
    const query: any = { _id: { $in: projectIds } };
    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query);

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    next(new CustomError((error as Error).message));
  }
};