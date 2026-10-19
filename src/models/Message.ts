import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
  name: string;
  email: string;
  projectType: string;
  message: string;
  isRead: boolean;
  isReplied?: boolean;
  repliedAt?: Date;
  replyMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    projectType: {
      type: String,
      default: "Frontend Web App",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
    repliedAt: {
      type: Date,
    },
    replyMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
