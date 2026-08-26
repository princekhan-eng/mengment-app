import mongoose, { Document, Model, Schema } from "mongoose";

export type NotificationType = "task_assigned" | "task_updated" | "new_message" | "system";

export interface INotification extends Document {
    recipientId: string;
    senderId: string;
    senderName: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        recipientId: { type: String, required: true, index: true },
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        type: {
            type: String,
            enum: ["task_assigned", "task_updated", "new_message", "system"],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        link: { type: String },
        isRead: { type: Boolean, default: false, index: true },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification: Model<INotification> =
    mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
