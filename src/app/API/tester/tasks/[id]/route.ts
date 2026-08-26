import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectdb";
import Task from "@/models/Task.model";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const { status, testingResult } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Task ID is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (testingResult) updateData.testingResult = testingResult;
        if (status === "completed") updateData.completedAt = new Date();

        const task = await Task.findByIdAndUpdate(id, updateData, { new: true });

        if (!task) {
            return NextResponse.json(
                { success: false, message: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Tester result updated successfully",
            task,
        });
    } catch (error: any) {
        console.error("Tester update task error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update task" },
            { status: 500 }
        );
    }
}
