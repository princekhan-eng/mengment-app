import mongoose, {
    Document,
    Schema,
} from "mongoose";

export interface IManager extends Document {
    employeeId: string;

    name: string;

    email: string;

    password: string;

    role: "manager";

    isActive: boolean;

    isVerified: boolean;

    createdAt: Date;

    updatedAt: Date;

    createdBy: mongoose.Schema.Types.ObjectId;



}

const managerSchema = new Schema<IManager>(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            match: /^\d{8}$/,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["manager"],
            default: "manager",
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isVerified: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",


        },
    },
    {
        timestamps: true,
    }
);

const Manager =
    mongoose.models.Manager ||
    mongoose.model<IManager>(
        "Manager",
        managerSchema
    );

export default Manager;