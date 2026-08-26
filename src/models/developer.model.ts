import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";

export interface IDeveloper extends Document {
    employeeId: string;
    name: string;
    email: string;
    password: string;

    managerEmplyId: string;
    createdBy: Types.ObjectId;

    isActive: boolean;
    isVerified: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const developerSchema = new Schema<IDeveloper>(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            uppercase: true,
            trim: true,
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

        managerEmplyId: {
            type: String,
            required: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
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
    },
    {
        timestamps: true,
    }
);

const Developer =
    mongoose.models.Developer ||
    mongoose.model<IDeveloper>(
        "Developer",
        developerSchema
    );

export default Developer;