import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type TaskRole = "developer" | "tester";

export type TaskStatus =
    | "pending"
    | "in-progress"
    | "completed"
    | "cancelled";

export type TaskPriority =
    | "low"
    | "medium"
    | "high"
    | "urgent";

export interface ITask extends Document {
    title: string;
    description: string;

    // Manager who assigned the task
    assignedBy: Types.ObjectId;

    // Developer or Tester receiving the task
    assignedTo: Types.ObjectId;

    // Role of employee receiving task
    assignedToRole: TaskRole;

    // Employee ID for easy identification
    employeeId: string;

    priority: TaskPriority;

    status: TaskStatus;

    dueDate?: Date;

    completedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        // Manager who assigned the task
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "Manager",
            required: true,
            index: true,
        },

        // Developer / Tester
        assignedTo: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        // developer or tester
        assignedToRole: {
            type: String,
            enum: ["developer", "tester"],
            required: true,
        },

        // Example: DEV-001 / TST-001
        employeeId: {
            type: String,
            required: true,
            index: true,
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "urgent",
            ],
            default: "medium",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "in-progress",
                "completed",
                "cancelled",
            ],
            default: "pending",
        },

        dueDate: {
            type: Date,
        },

        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Useful queries
taskSchema.index({
    assignedBy: 1,
    assignedTo: 1,
});

taskSchema.index({
    assignedTo: 1,
    status: 1,
});

const Task: Model<ITask> =
    mongoose.models.Task ||
    mongoose.model<ITask>("Task", taskSchema);

export default Task;