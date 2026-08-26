import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";

export interface ITester extends Document {
    employeeId: string;

    name: string;

    email: string;

    password: string;

    managerId: Types.ObjectId;

    createdBy: Types.ObjectId;

    isActive: boolean;

    isVerified: boolean;

    createdAt: Date;

    updatedAt: Date;
}

const testerSchema = new Schema<ITester>(
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

        /*
         * Manager responsible for this tester
         */
        managerId: {
            type: Schema.Types.ObjectId,
            ref: "Manager",
            required: true,
        },

        /*
         * Admin who created this tester
         */
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

const Tester =
    mongoose.models.Tester ||
    mongoose.model<ITester>(
        "Tester",
        testerSchema
    );

export default Tester;