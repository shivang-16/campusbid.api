import { Request, Response, NextFunction } from "express";
import { CustomError } from "./error";

const checkRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (role === "provider" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));
    if (role === "client" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));

    next();
  };
};

export default checkRole;
