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

        let adminId: string | null = null;

        const { searchParams } = new URL(request.url);
        const queryAdminId = searchParams.get("adminId");

        if (queryAdminId && mongoose.Types.ObjectId.isValid(queryAdminId)) {
            adminId = queryAdminId;
        } else {
            const decoded = getAuthPayload(request);
            if (decoded && decoded.userId) {
                const uid = decoded.userId;
                const isObjId = mongoose.Types.ObjectId.isValid(uid);

                // 1. Check if logged in user is Admin
                let adminUser = null;
                if (isObjId) {
                    adminUser = await User.findById(uid).lean();
                }

                if (adminUser) {
                    adminId = adminUser._id.toString();
                } else {
                    // 2. Check if logged in user is Manager
                    const mgrQuery: any[] = [{ employeeId: uid }];
                    if (isObjId) mgrQuery.push({ _id: uid });

                    const mgr = await Manager.findOne({ $or: mgrQuery }).lean();
                    if (mgr && mgr.createdBy) {
                        adminId = mgr.createdBy.toString();
                    } else {
                        // 3. Check if logged in user is Developer
                        const devQuery: any[] = [{ employeeId: uid }];
                        if (isObjId) devQuery.push({ _id: uid });

                        const dev = await Developer.findOne({ $or: devQuery }).lean();
                        if (dev && dev.createdBy) {
                            adminId = dev.createdBy.toString();
                        } else {
                            // 4. Check if logged in user is Tester
                            const tstQuery: any[] = [{ employeeId: uid }];
                            if (isObjId) tstQuery.push({ _id: uid });

                            const tst = await Tester.findOne({ $or: tstQuery }).lean();
                            if (tst && tst.createdBy) {
                                adminId = tst.createdBy.toString();
                            }
                        }
                    }
                }
            }
        }

        let adminFilter: any = { role: "admin" };
        let managerFilter: any = {};
        let developerFilter: any = {};
        let testerFilter: any = {};

        if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
            adminFilter = { _id: adminId };
            managerFilter = { createdBy: adminId };
            developerFilter = { createdBy: adminId };
            testerFilter = { createdBy: adminId };
        }

        const [admins, managers, developers, testers] = await Promise.all([
            User.find(adminFilter).select("_id name email role").lean(),
            Manager.find(managerFilter).select("_id employeeId name email role createdBy").lean(),
            Developer.find(developerFilter).select("_id employeeId name email createdBy").lean(),
            Tester.find(testerFilter).select("_id employeeId name email createdBy").lean(),
        ]);

        const membersList = [
            ...admins.map((a: any) => ({
                id: a._id.toString(),
                name: a.name,
                email: a.email,
                role: "admin" as const,
            })),
            ...managers.map((m: any) => ({
                id: m._id.toString(),
                employeeId: m.employeeId,
                name: m.name,
                email: m.email,
                role: "manager" as const,
            })),
            ...developers.map((d: any) => ({
                id: d._id.toString(),
                employeeId: d.employeeId,
                name: d.name,
                email: d.email,
                role: "developer" as const,
            })),
            ...testers.map((t: any) => ({
                id: t._id.toString(),
                employeeId: t.employeeId,
                name: t.name,
                email: t.email,
                role: "tester" as const,
            })),
        ];

        const uniqueMembers = Array.from(
            new Map(membersList.map((item) => [item.id, item])).values()
        );

        return NextResponse.json({
            success: true,
            adminId,
            members: uniqueMembers,
        });
    } catch (error: any) {
        console.error("Fetch team members error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch team members" },
            { status: 500 }
        );
    }
}
