import { Request, Response, NextFunction } from "express";
import { CustomError } from "./error";

const checkRole = (role: 'freelancer' | 'client') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (role === "freelancer" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));
    if (role === "client" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));

    next();
  };
};

export default checkRole;
