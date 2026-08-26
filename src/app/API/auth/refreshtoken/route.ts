import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/helper/GenrateTokens";

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

        // Verify existing refresh token
        const payload = verifyRefreshToken(refreshToken);

        if (!payload || !payload.userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid refresh token payload",
                },
                { status: 401 }
            );
        }

        // Token Rotation: Generate new Access Token AND new Refresh Token
        const newAccessToken = generateAccessToken({
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
                message: "Access token and refresh token renewed successfully",
            },
            { status: 200 }
        );

        // Store new access token in HttpOnly cookie (15 mins)
        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60,
            path: "/",
        });

        // Store new refresh token in HttpOnly cookie (7 days - renewed)
        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Refresh token rotation error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Invalid or expired refresh token",
            },
            { status: 401 }
        );
    }
}

export async function GET(req: NextRequest) {
    return POST(req);
}
