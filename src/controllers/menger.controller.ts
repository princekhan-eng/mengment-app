import {
    NextRequest,
    NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectdb";
import { getAuthPayload } from "@/helper/authCheck";
import Manager from "@/models/menager.model";
import { generateEmployeeId } from "@/helper/generateEmployeeId";
import Developer from "@/models/developer.model";
interface AccessTokenPayload {
    userId: string;
    role: "admin" | "manager" | "developer" | "tester";
}
export async function createManagerController(
    request: NextRequest
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
                    message: "Only admin can create managers",
                },
                { status: 403 }
            );
        }

        // Get request body
        const body = await request.json();

        const {
            name,
            email,
            password,
        } = body;

        // =========================
        // Validation
        // =========================

        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Name, email and password are required",
                },
                {
                    status: 400,
                }
            );
        }

        // Validate name
        if (typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Name must be at least 2 characters",
                },
                {
                    status: 400,
                }
            );
        }

        // Validate email
        if (typeof email !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email",
                },
                {
                    status: 400,
                }
            );
        }

        // Validate password
        if (
            typeof password !== "string" ||
            password.length < 6
        ) {
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

        // =========================
        // Normalize email
        // =========================

        const normalizedEmail =
            email.trim().toLowerCase();

        // =========================
        // Check existing manager
        // =========================

        const existingManager =
            await Manager.findOne({
                email: normalizedEmail,
            });

        if (existingManager) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A manager with this email already exists",
                },
                {
                    status: 409,
                }
            );
        }

        // =========================
        // Generate unique employee ID
        // =========================

        const employeeId =
            await generateEmployeeId();

        // =========================
        // Hash password
        // =========================

        const hashedPassword =
            await bcrypt.hash(password, 12);

        // =========================
        // Create manager
        // =========================
        console.log(decoded.userId);
        const manager = await Manager.create({
            employeeId,

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: "manager",

            isActive: true,

            createdBy: decoded.userId,

            isVerified: true,
        });

        // =========================
        // Response
        // =========================

        return NextResponse.json(
            {
                success: true,

                message:
                    "Manager created successfully",

                manager: {
                    _id: manager._id,

                    employeeId:
                        manager.employeeId,

                    name: manager.name,

                    email: manager.email,

                    role: manager.role,

                    isActive:
                        manager.isActive,

                    isVerified:
                        manager.isVerified,

                    createdAt:
                        manager.createdAt,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error: any) {
        console.error(
            "CREATE_MANAGER_ERROR:",
            error
        );

        // Duplicate key error
        if (error?.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Email or employee ID already exists",
                },
                {
                    status: 409,
                }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error" + error.message,
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

export async function getManagers(request: NextRequest) {
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
                    message: "Only admin can access managers",
                },
                { status: 403 }
            );
        }

        const managers = await Manager.find({ createdBy: decoded.userId })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            {
                success: true,
                managers: [managers],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET MANAGERS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}
export async function getdevlopers(request: NextRequest) {
    try {
        await connectDB();
        const accessToken = request.cookies.get("accessToken")?.value;
        if (!accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Access token is required",
                },
                { status: 401 }
            );
        }
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            return NextResponse.json(
                {
                    success: false,
                    message: "JWT secret is missing",
                },
                { status: 500 }
            );
        }
        let decoded: AccessTokenPayload;
        try {
            decoded = jwt.verify(
                accessToken,
                secret
            ) as AccessTokenPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired access token",
                },
                { status: 401 }
            );
        }
        if (decoded.role !== "manager") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only manager can access developers",
                },
                { status: 403 }
            );
        }
        console.log(decoded.userId);
        const developers = await Developer.find({ managerEmplyId: decoded.userId })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json(
            {
                success: true,
                developers: [developers],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET MANAGERS ERROR:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}   