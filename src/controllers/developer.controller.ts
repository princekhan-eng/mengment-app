import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectdb";
import { getAuthPayload } from "@/helper/authCheck";
import Developer from "@/models/developer.model";
import Manager from "@/models/menager.model";
import { generateEmployeeId } from "@/helper/generateEmployeeId";
import dns from "dns";
import Task from "@/models/Task.model";



interface AccessTokenPayload {
    userId: string;
    role: "admin" | "manager" | "developer" | "tester";
}

export async function createDeveloperController(
    request: NextRequest,
    adminId: string
) {
    try {
        await connectDB();

        const decoded = getAuthPayload(request);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication token is required or expired",
                },
                { status: 401 }
            );
        }

        if (decoded.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only admin can create developers",
                },
                { status: 403 }
            );
        }

        const body = await request.json();

        const {
            name,
            email,
            password,
            managerEmplyId,
            manageremplyid,
            managerId,
        } = body;

        const targetManagerEmplyId = managerEmplyId || manageremplyid || managerId;

        // Validation

        if (
            !name ||
            !email ||
            !password ||
            !targetManagerEmplyId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Name, email, password and manager are required",
                },
                {
                    status: 400,
                }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password must be at least 6 characters",
                },
                {
                    status: 400,
                }
            );
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        // Check email

        const existingDeveloper =
            await Developer.findOne({
                email: normalizedEmail,
            });

        if (existingDeveloper) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A user with this email already exists",
                },
                {
                    status: 409,
                }
            );
        }

        // Check manager

        const manager =
            await Manager.findOne({
                employeeId: targetManagerEmplyId,
                role: "manager",
                isActive: true,
            });

        if (!manager) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Manager not found or inactive",
                },
                {
                    status: 404,
                }
            );
        }

        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 12);

        // Generate employee ID

        const employeeId =
            await generateEmployeeId();

        // Create developer

        const developer =
            await Developer.create({
                employeeId,

                name: name.trim(),

                email: normalizedEmail,

                password: hashedPassword,

                role: "developer",

                managerEmplyId: manager.employeeId,

                createdBy: decoded.userId,

                isActive: true,

                isVerified: true,
            });

        return NextResponse.json(
            {
                success: true,

                message:
                    "Developer created successfully",

                developer: {
                    _id: developer._id,

                    employeeId:
                        developer.employeeId,

                    name: developer.name,

                    email: developer.email,

                    role: developer.role,

                    managerEmplyId:
                        developer.managerEmplyId,

                    isActive:
                        developer.isActive,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "CREATE_DEVELOPER_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            {
                status: 500,
            }
        );
    }
}

interface AccessTokenPayload {
    userId: string;
    role: "admin" | "manager" | "developer" | "tester";
}

export async function getDeveloper(request: NextRequest) {
    try {
        dns.setServers([
            "[1.1.1.1]",
        ]);
        await connectDB();

        const decoded = getAuthPayload(request);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication token is required or expired",
                },
                { status: 401 }
            );
        }


        const developers = await Developer.find({ createdBy: decoded.userId })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();
        if (developers.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No developers found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                developers: [developers],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET DEVELOPERS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error" + (error instanceof Error ? `: ${error.message}` : ""),
            },
            { status: 500 }
        );
    }
}

export async function getDeveloperTasks(request: NextRequest) {
    try {
        await connectDB();

        const decoded = getAuthPayload(request);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication token is required or expired",
                },
                { status: 401 }
            );
        }

        const tasks = await Task.find({
            $or: [
                { assignedTo: decoded.userId },
                { developerId: decoded.userId },
                { employeeId: decoded.userId },
                { assignedToRole: "developer" },
            ],
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            {
                success: true,
                tasks: tasks,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("GET DEVELOPER TASKS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error: " + (error?.message || ""),
            },
            { status: 500 }
        );
    }
}

export async function getme(request: NextRequest) {
    try {
        await connectDB();

        const decoded = getAuthPayload(request);

        if (!decoded) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication token is required or expired",
                },
                { status: 401 }
            );
        }

        const developer = await Developer.findOne({
            $or: [{ employeeId: decoded.userId }, { _id: decoded.userId }],
        })
            .select("-password")
            .lean();

        if (!developer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Developer profile not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                developer: developer,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("GET DEVELOPER ME ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error: " + (error?.message || ""),
            },
            { status: 500 }
        );
    }
}