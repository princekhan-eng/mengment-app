import mongoose, {
    Schema,
    Document,
    Types,
} from "mongoose";

export interface ISession extends Document {
    userId: Types.ObjectId;
    sessionToken: string;
    expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        sessionToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

sessionSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 0,
    }
);

const Session =
    mongoose.models.Session ||
    mongoose.model<ISession>(
        "Session",
        sessionSchema
    );

export default Session;