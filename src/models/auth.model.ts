import mongoose, {
    Document,
    Model,
} from "mongoose";

import bcrypt from "bcryptjs";

/* =========================================
   USER INTERFACE
========================================= */

export interface Iuser extends Document {
    name: string;

    email: string;

    password: string;

    role: string;

    OTP?: string;

    OTPExpiry?: Date;

    isVerified: boolean;

    refreshtoken?: string;

    /* Methods */

    comparePassword(
        password: string
    ): Promise<boolean>;


    compareRefreshToken(
        token: string
    ): Promise<boolean>;
}

/* =========================================
   USER MODEL INTERFACE
========================================= */

export interface IUserModel
    extends Model<Iuser> {

    hashValue(
        value: string
    ): Promise<string>;
}

/* =========================================
   USER SCHEMA
========================================= */

const userSchema = new mongoose.Schema<
    Iuser,
    IUserModel
>(
    {
        /* =========================
           NAME
        ========================= */

        name: {
            type: String,
            required: true,
            trim: true,
        },

        /* =========================
           EMAIL
        ========================= */

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        /* =========================
           PASSWORD
        ========================= */

        password: {
            type: String,
            required: true,
        },

        /* =========================
           ROLE
        ========================= */

        role: {
            type: String,
            required: true,
        },

        /* =========================
           OTP
        ========================= */

        OTP: {
            type: String,
        },

        /* =========================
           OTP EXPIRY
        ========================= */

        OTPExpiry: {
            type: Date,
        },

        /* =========================
           EMAIL VERIFIED
        ========================= */

        isVerified: {
            type: Boolean,
            default: false,
        },

        /* =========================
           REFRESH TOKEN
        ========================= */

        refreshtoken: {
            type: String,
        },
    },

    {
        timestamps: true,
    }
);

/* =========================================
   HASH PASSWORD
========================================= */

userSchema.pre(
    "save",
    async function () {

        // Only hash when password changes
        if (!this.isModified("password")) {
            return;
        }

        this.password =
            await bcrypt.hash(
                this.password,
                12
            );
    }
);

// /* =========================================
//    HASH OTP
// ========================================= */

// userSchema.pre(
//     "save",
//     async function () {

//         // OTP doesn't exist
//         if (!this.OTP) {
//             return;
//         }

//         // Only hash when OTP changes
//         if (!this.isModified("OTP")) {
//             return;
//         }

//         this.OTP =
//             await bcrypt.hash(
//                 this.OTP,
//                 10
//             );
//     }
// );

/* =========================================
   HASH REFRESH TOKEN
========================================= */

userSchema.pre(
    "save",
    async function () {

        // Refresh token doesn't exist
        if (!this.refreshtoken) {
            return;
        }

        // Only hash when refresh token changes
        if (!this.isModified("refreshtoken")) {
            return;
        }

        this.refreshtoken =
            await bcrypt.hash(
                this.refreshtoken,
                10
            );
    }
);

/* =========================================
   COMPARE PASSWORD
========================================= */

userSchema.methods.comparePassword =
    async function (
        password: string
    ): Promise<boolean> {

        return bcrypt.compare(
            password,
            this.password
        );
    };

/* =========================================
   COMPARE OTP
========================================= */

// userSchema.methods.compareOTP =
//     async function (
//         otp: string
//     ): Promise<boolean> {

//         if (!this.OTP) {
//             return false;
//         }

//         return bcrypt.compare(
//             otp,
//             this.OTP
//         );
//     };

/* =========================================
   COMPARE REFRESH TOKEN
========================================= */

userSchema.methods.compareRefreshToken =
    async function (
        token: string
    ): Promise<boolean> {

        if (!this.refreshtoken) {
            return false;
        }

        return bcrypt.compare(
            token,
            this.refreshtoken
        );
    };

/* =========================================
   HASH VALUE STATIC METHOD
========================================= */

userSchema.statics.hashValue =
    async function (
        value: string
    ): Promise<string> {

        return bcrypt.hash(
            value,
            10
        );
    };

/* =========================================
   NEXT.JS / MONGOOSE HOT RELOAD SAFE MODEL
========================================= */

const User =
    mongoose.models.User ||
    mongoose.model<Iuser, IUserModel>(
        "User",
        userSchema
    );

/* =========================================
   EXPORT
========================================= */

export default User;