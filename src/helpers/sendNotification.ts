import { ObjectId } from "mongoose";
import { Notification } from "../models/notificationModel"
import { EmailOptions, sendMail } from "../utils/sendMail"

export type NotificationOptions = {
    senderId: string | ObjectId;
    receiverId: string | ObjectId;
    message: string;
    projectId?: string | ObjectId;
    bidId?: string | ObjectId;
    tag?: string
}

export const sendNotification = async(notification: NotificationOptions, email?: EmailOptions) => {
    try { 
        await Notification.create({
            sender: notification.senderId,
            receiver: notification.receiverId,
            details: {
                message: notification.message,
                projectId: notification?.projectId,
                bidId: notification?.bidId
            },
            tag: notification?.tag
        })
    } catch (error) {
        return error
    }

    try {
        if(email) await sendMail(email)
    } catch (error) {
        return error
    }

   
}