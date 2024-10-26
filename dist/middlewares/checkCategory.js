"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeSubscriber = void 0;
const error_1 = require("./error");
const categoryHierarchy = ['basic', 'pro', 'premium', 'free'];
const authorizeSubscriber = (requiredCategory) => {
    return async (req, res, next) => {
        const user = req.user;
        if (user.subscription.status !== 'active' && !user.freeTrial.active) {
            return next(new error_1.CustomError("You don't have an active subscription or free trial", 403));
        }
        const userCategoryIndex = categoryHierarchy.indexOf(user.category);
        const requiredCategoryIndex = categoryHierarchy.indexOf(requiredCategory);
        if (userCategoryIndex < requiredCategoryIndex) {
            return next(new error_1.CustomError(`This feature requires a ${requiredCategory} subscription or higher`, 403));
        }
        next();
    };
};
exports.authorizeSubscriber = authorizeSubscriber;
