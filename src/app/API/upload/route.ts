import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name || `upload_${Date.now()}`;

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: fileName,
            folder: "/managehub_uploads",
        });

        return NextResponse.json({
            success: true,
            url: uploadResponse.url,
            fileId: uploadResponse.fileId,
            name: uploadResponse.name,
            fileType: file.type || "application/octet-stream",
            size: file.size,
        });
    } catch (error: any) {
        console.error("Upload API error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to upload file" },
            { status: 500 }
        );
    }
}
