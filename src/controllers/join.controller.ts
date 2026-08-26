import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/connectdb";

import Manager from "@/models/menager.model";
import Developer from "@/models/developer.model";
import Tester from "@/models/tester.model";
import { generateAccessToken, generateRefreshToken, TokenPayload, type UserRole } from "@/helper/GenrateTokens";




export async function JOIN_TEAM(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();

        const {
            employeeId,
            password,
            role,
        } = body;

        // =========================
        // VALIDATION
        // =========================

        if (!employeeId || !password || !role) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Employee ID, password and role are required",
                },
                { status: 400 }
            );
        }

        const cleanEmployeeId =
            employeeId.toString().trim();

        let employee: any = null;

        // =========================
        // FIND EMPLOYEE
        // =========================

        if (role === "manager") {
            employee = await Manager.findOne({
                employeeId: cleanEmployeeId,
            });
        } else if (role === "developer") {
            employee = await Developer.findOne({
                employeeId: cleanEmployeeId,
            });
        } else if (role === "tester") {
            employee = await Tester.findOne({
                employeeId: cleanEmployeeId,
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid role",
                },
                { status: 400 }
            );
        }

        // =========================
        // EMPLOYEE NOT FOUND
        // =========================

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message: `${role} not found`,
                },
                { status: 404 }
            );
        }

        // =========================
        // CHECK PASSWORD
        // =========================

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                employee.password
            );

        if (!isPasswordCorrect) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid employee ID or password",
                },
                { status: 401 }
            );
        }

        // =========================
        // CREATE TOKEN
        // =========================

        const payload: TokenPayload = {
            userId: cleanEmployeeId,
            role: role as UserRole,
        };

        console.log("TOKEN PAYLOAD:", payload);

        const accessToken =
            generateAccessToken(payload);

        const refreshToken =
            generateRefreshToken(payload);

        console.log("ACCESS TOKEN GENERATED");
        console.log("REFRESH TOKEN GENERATED");

        // =========================
        // CREATE RESPONSE
        // =========================

        const response = NextResponse.json(
            {
                success: true,
                message: `${role} login successful`,
                employee: {
                    id: employee._id,
                    name: employee.name,
                    employeeId:
                        employee.employeeId,
                    role,
                },
            },
            { status: 200 }
        );

        // =========================
        // ACCESS TOKEN COOKIE
        // =========================

        response.cookies.set(
            "accessToken",
            accessToken,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 15,
            }
        );

        // =========================
        // REFRESH TOKEN COOKIE
        // =========================

        response.cookies.set(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            }
        );

        // =========================
        // RETURN SAME RESPONSE
        // =========================

        return response;

    } catch (error: any) {
        console.error(
            "JOIN TEAM ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error",
                error: error.message,
            },
            { status: 500 }
        );
    }
}