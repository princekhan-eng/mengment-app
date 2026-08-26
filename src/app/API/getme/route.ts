import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connectdb";
import User from "@/models/auth.model";
import Manager from "@/models/menager.model";
import Developer from "@/models/developer.model";
import Tester from "@/models/tester.model";
import { getAuthPayload } from "@/helper/authCheck";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // 1. Get authenticated user payload using access token or refresh token fallback
        const decoded = getAuthPayload(request);

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { success: false, message: "Authentication required or token expired" },
                { status: 401 }
            );
        }

        const userId = decoded.userId;
        const isObjId = mongoose.Types.ObjectId.isValid(userId);

        const queryList: any[] = [{ employeeId: userId }];
        if (isObjId) {
            queryList.push({ _id: userId });
        }

        // 2. Try finding Manager by employeeId or _id
        let manager = await Manager.findOne({ $or: queryList }).lean();
        if (manager) {
            return NextResponse.json({
                success: true,
                user: {
                    ...manager,
                    id: manager._id.toString(),
                    role: "manager",
                },
            });
        }

        // 3. Try finding Developer
        let developer = await Developer.findOne({ $or: queryList }).lean();
        if (developer) {
            return NextResponse.json({
                success: true,
                user: {
                    ...developer,
                    id: developer._id.toString(),
                    role: "developer",
                },
            });
        }

        // 4. Try finding Tester
        let tester = await Tester.findOne({ $or: queryList }).lean();
        if (tester) {
            return NextResponse.json({
                success: true,
                user: {
                    ...tester,
                    id: tester._id.toString(),
                    role: "tester",
                },
            });
        }

        // 5. Try finding Admin / User
        if (isObjId) {
            let user = await User.findById(userId).lean();
            if (user) {
                return NextResponse.json({
                    success: true,
                    user: {
                        ...user,
                        id: user._id.toString(),
                        role: user.role || "admin",
                    },
                });
            }
        }

        return NextResponse.json(
            { success: false, message: "User account not found" },
            { status: 404 }
        );
    } catch (error: any) {
        console.error("getme route error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Authentication error" },
            { status: 401 }
        );
    }
}
