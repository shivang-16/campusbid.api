import mongoose from "mongoose";

export interface INotification  {
    receiver: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    details: {
        message: string;
        projectId: mongoose.Types.ObjectId;
        bidId: mongoose.Types.ObjectId;
    },
    tag: string;
    unread: boolean;
    createdAt: Date
}

const notificationSchema = new mongoose.Schema<INotification>({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, 
  details: {
    message: String,
    projectId: mongoose.Schema.Types.ObjectId,
    bidId: mongoose.Schema.Types.ObjectId,
  },
  tag: String,
  unread: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);