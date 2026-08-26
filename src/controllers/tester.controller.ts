import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/connectdb";
import { getAuthPayload } from "@/helper/authCheck";
import Tester from "@/models/tester.model";
import Manager from "@/models/menager.model";
import jwt from "jsonwebtoken";
import { generateEmployeeId } from "@/helper/generateEmployeeId";
interface AccessTokenPayload {
    userId: string;
    role: "admin" | "manager" | "developer" | "tester";
}
export async function createTesterController(
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
                    message: "Only admin can create testers",
                },
                { status: 403 }
            );
        }


        const body = await request.json();

        const {
            name,
            email,
            password,
            managerId,
        } = body;

        // Validation

        if (
            !name ||
            !email ||
            !password ||
            !managerId
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

        const existingTester =
            await Tester.findOne({
                email: normalizedEmail,
            });

        if (existingTester) {
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
                _id: managerId,
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
        const employeeId =
            await generateEmployeeId();

        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 12);

        // Create tester

        const tester = await Tester.create({
            employeeId,

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: "tester",

            managerId: manager._id,

            createdBy: decoded.userId,

            isActive: true,

            isVerified: true,
        });

        return NextResponse.json(
            {
                success: true,

                message:
                    "Tester created successfully",

                tester: {
                    _id: tester._id,

                    employeeId:
                        tester.employeeId,

                    name: tester.name,

                    email: tester.email,

                    role: tester.role,

                    managerId:
                        tester.managerId,

                    isActive:
                        tester.isActive,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "CREATE_TESTER_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}


interface AccessTokenPayload {
    _id: string;
    role: "admin" | "manager" | "developer" | "tester";
}

export async function getTester(request: NextRequest) {
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
                    message: "Only admin can access testers",
                },
                { status: 403 }
            );
        }

        const testers = await Tester.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            {
                success: true,
                testers,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET TESTERS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}