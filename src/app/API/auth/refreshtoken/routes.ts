import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/helper/GenrateTokens";


export async function POST(req: NextRequest) {
    try {
        // Get refresh token from HttpOnly cookie
        const refreshToken = req.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Refresh token not found",
                },
                { status: 401 }
            );
        }

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: payload.userId,
            role: payload.role,
        });

        const newRefreshToken = generateRefreshToken({
            userId: payload.userId,
            role: payload.role,
        });

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: "Access token refreshed successfully",
            },
            { status: 200 }
        );

        // Store new access token in HttpOnly cookie
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
        console.error("Refresh token error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Invalid or expired refresh token",
            },
            { status: 401 }
        );
    }
}