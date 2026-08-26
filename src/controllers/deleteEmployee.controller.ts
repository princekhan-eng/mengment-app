import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectdb";
import Manager from "@/models/menager.model";
import Developer from "@/models/developer.model";
import Tester from "@/models/tester.model";
import { getAuthPayload } from "@/helper/authCheck";

export async function deleteManager(request: NextRequest, id: string) {
    try {
        await connectDB();
        const decoded = getAuthPayload(request);

        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Only admin can delete managers" },
                { status: 403 }
            );
        }

        const deleted = await Manager.findOneAndDelete({
            $or: [{ _id: id }, { employeeId: id }],
        });

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Manager not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Manager deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete manager error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete manager" },
            { status: 500 }
        );
    }
}

export async function deleteDeveloper(request: NextRequest, id: string) {
    try {
        await connectDB();
        const decoded = getAuthPayload(request);

        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        if (decoded.role !== "admin" && decoded.role !== "manager") {
            return NextResponse.json(
                { success: false, message: "Unauthorized to delete developers" },
                { status: 403 }
            );
        }

        const deleted = await Developer.findOneAndDelete({
            $or: [{ _id: id }, { employeeId: id }],
        });

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Developer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Developer deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete developer error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete developer" },
            { status: 500 }
        );
    }
}

export async function deleteTester(request: NextRequest, id: string) {
    try {
        await connectDB();
        const decoded = getAuthPayload(request);

        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        if (decoded.role !== "admin" && decoded.role !== "manager") {
            return NextResponse.json(
                { success: false, message: "Unauthorized to delete testers" },
                { status: 403 }
            );
        }

        const deleted = await Tester.findOneAndDelete({
            $or: [{ _id: id }, { employeeId: id }],
        });

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Tester not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Tester deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete tester error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete tester" },
            { status: 500 }
        );
    }
}
