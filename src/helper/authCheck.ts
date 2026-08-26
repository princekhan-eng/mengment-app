import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthPayload {
    userId: string;
    role: "admin" | "manager" | "developer" | "tester";
}

export function getAuthPayload(request: NextRequest): AuthPayload | null {
    const accessSecret = process.env.ACCESS_TOKEN_SECRET || "fallback_access_secret";
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret";

    // 1. Try verifying Access Token
    const accessToken = request.cookies.get("accessToken")?.value;
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, accessSecret) as AuthPayload;
            if (decoded && decoded.userId) {
                return decoded;
            }
        } catch (e) {
            // Access token expired, fallback to refresh token
        }
    }

    // 2. Fallback to verifying Refresh Token
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, refreshSecret) as AuthPayload;
            if (decoded && decoded.userId) {
                return decoded;
            }
        } catch (e) {
            // Refresh token expired or invalid
        }
    }

    return null;
}
