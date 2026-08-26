import { NextRequest, NextResponse } from "next/server";
//========================================================================================
import {
    generateAccessToken,
    generateRefreshToken,
} from "../helper/GenrateTokens";
//========================================================================================
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, updatePasswordSchema } from "@/schemas/auth.schemas";
//========================================================================================
import User from "@/models/auth.model";
//========================================================================================
import GenrateOTP from "@/helper/GenrateOTP";
//========================================================================================
import { otpEmailTemplate } from "@/services/emailTemplates";
//========================================================================================
import { sendEmail } from "@/services/transpoter";
//========================================================================================
import Session from "@/models/session.model";
//========================================================================================
import connectDB from "@/lib/connectdb"
//========================================================================================
import dns from "node:dns/promises"
//========================================================================================
//api/auth/register POST
//========================================================================================
export const Register = async (req: NextRequest) => {
    try {
        await dns.setServers(["8.8.8.8"]);
        console.log("DNS servers set successfully");
        await connectDB();
        const body = await req.json();
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request",
                    error: result.error,
                },
                { status: 400 }
            );
        }
        const { name, email, password, role } = result.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User already exists",
                },
                { status: 400 }
            );
        }


        const OTP = GenrateOTP.GenerateOTP();

        const user = await User.create({
            name,
            email,
            password,
            role,
            OTP: OTP.otp,
            OTPExpiry: OTP.time,
            isVerified: false,
        });
        console.log(OTP.otp);
        // await sendEmail(
        //     user.email,
        //     "Verify your email",
        //     otpEmailTemplate(user.name, OTP.otp)
        // );

        return NextResponse.json(
            {
                success: true,
                message: "OTP sent successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Registration error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 401 }
        );
    }

}
//========================================================================================
//api/auth/verify POST
//========================================================================================
export const Verify = async (req: Request) => {
    try {
        await dns.setServers(["8.8.8.8"]);
        await connectDB();
        const { email, otp } = await req.json();
        const user = await User.findOne({ email });
        console.log(email, otp);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }

        if (otp !== user.OTP) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired OTP",
                },
                { status: 401 }
            );
        }
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user._id.toString(),
            role: user.role,
        });
        user.isVerified = true;
        user.OTP = "";
        user.OTPExpiry = undefined;
        user.refreshtoken = refreshToken;
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Email verified successfully",
                accessToken
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 401 }
        );
    }

}
//========================================================================================
//api/auth/login POST
//========================================================================================
export const Login = async (req: Request) => {
    try {
        await dns.setServers(["8.8.8.8"]);
        await connectDB();
        const body = await req.json();
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request",
                    error: result.error,
                },
                { status: 400 }
            );
        }
        const { email, password } = result.data;
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid password",
                },
                { status: 401 }
            );
        }
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            role: user.role,
        });
        const refreshToken = generateRefreshToken({
            userId: user._id.toString(),
            role: user.role,
        });
        const sessionToken = crypto.randomUUID();

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await Session.create({
            userId: user._id,
            sessionToken,
            expiresAt,
        });


        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        // Store session token in HttpOnly cookie
        response.cookies.set(
            "sessionToken",
            sessionToken,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge:
                    7 * 24 * 60 * 60,
            }
        );
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60,
            path: "/",
        });

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });
        return response;

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 401 }
        );
    }
}
//========================================================================================
//api/auth/resendotp POST
//========================================================================================
export const resendOTP = async (req: Request) => {
    try {
        await connectDB();
        const body = await req.json();
        const result = forgotPasswordSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request",
                    error: result.error,
                },
                { status: 400 }
            );
        }
        const { email } = result.data;
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }
        const OTP = GenrateOTP.GenerateOTP();
        user.OTP = OTP.otp;
        user.OTPExpiry = OTP.time;
        await user.save();
        // await sendEmail(
        //     user.email,
        //     "Verify your email",
        //     otpEmailTemplate(user.name, OTP.otp)
        // );
        return NextResponse.json(
            {
                success: true,
                message: "OTP sent successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Resend OTP error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 401 }
        );
    }

}
//========================================================================================
//api/auth/forgotpassword POST
//========================================================================================
export const ForgotPassword = async (req: Request) => {

    try {
        await connectDB();
        const body = await req.json();
        const result = forgotPasswordSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request",
                    error: result.error,
                },
                { status: 400 }
            );
        }
        const { email } = result.data;
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }
        const OTP = GenrateOTP.GenerateOTP();
        user.OTP = OTP.otp;
        user.OTPExpiry = OTP.time;
        await user.save();
        await sendEmail(
            user.email,
            "Verify your email",
            otpEmailTemplate(user.name, OTP.otp)
        );
        return NextResponse.json(
            {
                success: true,
                message: "OTP sent successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 401 }
        );
    }


}
//========================================================================================
//api/auth/updatepassword POST
//========================================================================================
export const updatepassword = async (req: Request) => {
    try {
        await connectDB();
        const body = await req.json();
        const result = updatePasswordSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request",
                    error: result.error,
                },
                { status: 400 }
            );
        }
        const { password, email } = result.data;
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }
        user.password = password;
        await user.save();
        return NextResponse.json(
            {
                success: true,
                message: "Password updated successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update password error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }

}
//========================================================================================
//api/auth/resetpassword POST
//========================================================================================
export const ResetPassword = async (req: Request) => {
    try {
        await connectDB();
        const body = await req.json();
        const result = resetPasswordSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request",
                    error: result.error,
                },
                { status: 400 }
            );
        }
        const { password, email, oldPassword } = result.data;
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Password",
                },
                { status: 401 }
            );
        }
        user.password = password;
        await user.save();
        return NextResponse.json(
            {
                success: true,
                message: "Password reset successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }

}
//========================================================================================
//api/auth/logout POST
//========================================================================================
export const Logout = async (req: Request) => {
    try {
        await connectDB();
        const response = NextResponse.json(
            {
                success: true,
                message: "Logout successful",
            },
            { status: 200 }
        );
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
    } catch (error) {
        console.error("Logout error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }

}
//========================================================================================
//==========================          END          =====================================//
//========================================================================================
