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

const checkRole = (role: 'freelancer' | 'client' | 'customer') => {
return async (req: Request, res: Response, next: NextFunction) => {
if (req.user.role !== role) {
return next(new CustomError("Not Authorised", 403));
}
next();
};
// If a separate function is truly needed for 'customer' or 'client' specific logic,
// ensure its internal checks match its defined role types.
// For example, if it's only for 'customer' and 'client':
/*
const checkRoleForCustomer = (role: 'customer' | 'client') => {
return async (req: Request, res: Response, next: NextFunction) => {
if (req.user.role !== role) {
return next(new CustomError("Not Authorised", 403));
}
next();
};
*/
export default checkRole; // Export the unified checkRole
export default checkRole; // Export the unified checkRole
    if (role === "freelancer" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));
    if (role === "client" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));

    next();
  };
};

export default checkRole;
