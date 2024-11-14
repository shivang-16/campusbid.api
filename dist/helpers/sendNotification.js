"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const notificationModel_1 = require("../models/notificationModel");
const sendMail_1 = require("../utils/sendMail");
const sendNotification = async (notification, email) => {
    try {
        await notificationModel_1.Notification.create({
            sender: notification.senderId,
            receiver: notification.receiverId,
            details: {
                message: notification.message,
                projectId: notification?.projectId,
                bidId: notification?.bidId
            },
            tag: notification?.tag
        });
    }
    catch (error) {
        return error;
    }
    try {
        if (email)
            await (0, sendMail_1.sendMail)(email);
    }
    catch (error) {
        return error;
    }
};
exports.sendNotification = sendNotification;
