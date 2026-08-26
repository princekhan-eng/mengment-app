import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAttachment {
    url: string;
    name: string;
    fileType: string;
    size?: number;
    fileId?: string;
}

export interface IMessage extends Document {
    senderId: string;
    senderName: string;
    senderRole: "admin" | "manager" | "developer" | "tester";
    receiverId?: string;
    roomId: string;
    content: string;
    attachments: IAttachment[];
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
    {
        url: { type: String, required: true },
        name: { type: String, required: true },
        fileType: { type: String, required: true },
        size: { type: Number },
        fileId: { type: String },
    },
    { _id: false }
);

const messageSchema = new Schema<IMessage>(
    {
        senderId: { type: String, required: true, index: true },
        senderName: { type: String, required: true },
        senderRole: {
            type: String,
            enum: ["admin", "manager", "developer", "tester"],
            required: true,
        },
        receiverId: { type: String, index: true },
        roomId: { type: String, required: true, index: true },
        content: { type: String, default: "" },
        attachments: [attachmentSchema],
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ roomId: 1, createdAt: 1 });

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
