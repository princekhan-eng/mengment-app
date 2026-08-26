import { NextResponse } from "next/server";
import { getAuthenticationParameters } from "@/lib/imagekit";

export async function GET() {
    try {
        const authParams = getAuthenticationParameters();
        return NextResponse.json({
            success: true,
            ...authParams,
        });
    } catch (error: any) {
        console.error("ImageKit auth error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to generate auth params" },
            { status: 500 }
        );
    }
}
