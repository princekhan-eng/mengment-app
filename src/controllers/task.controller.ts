import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "@/lib/connectdb";
import { getAuthPayload } from "@/helper/authCheck";
import Task from "@/models/Task.model";
import Manager from "@/models/menager.model";
import Developer from "@/models/developer.model";
import Tester from "@/models/tester.model";

interface AccessTokenPayload {
    userId: string;
    role:
    | "admin"
    | "manager"
    | "developer"
    | "tester";
}

type TaskRole = "developer" | "tester";

type TaskPriority =
    | "low"
    | "medium"
    | "high"
    | "urgent";


/*
=========================================================
GET MANAGER FROM ACCESS TOKEN
=========================================================
*/

function getManagerFromToken(
    request: NextRequest
):
    | {
        success: true;
        decoded: AccessTokenPayload;
    }
    | {
        success: false;
        response: NextResponse;
    } {
    const token =
        request.cookies.get("accessToken")?.value;

    if (!token) {
        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    message:
                        "Access token not found",
                },
                { status: 401 }
            ),
        };
    }

    try {
        const decoded =
            jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET!
            ) as AccessTokenPayload;

        if (!decoded.userId) {
            return {
                success: false,
                response: NextResponse.json(
                    {
                        success: false,
                        message:
                            "Invalid access token",
                    },
                    { status: 401 }
                ),
            };
        }
        console.log(decoded.role);


        return {
            success: true,
            decoded,
        };
    } catch (error) {
        console.error(
            "Access token verification error:",
            error
        );

        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired access token",
                },
                { status: 401 }
            ),
        };
    }
}
/*
=========================================================
CREATE TASK
POST /API/tasks/create
=========================================================
*/

export async function createTask(
    request: NextRequest
) {
    try {
        await connectDB();

        /*
        -------------------------------------------------
        Authenticate manager
        -------------------------------------------------
        */

        const auth =
            getManagerFromToken(request);

        if (!auth.success) {
            return auth.response;
        }

        const { userId } = auth.decoded;

        /*
        -------------------------------------------------
        Get request body
        -------------------------------------------------
        */

        const body = await request.json();

        const {
            title,
            description,
            assignedTo,
            assignedToRole,
            priority,
            dueDate,
        } = body;

        /*
        -------------------------------------------------
        Validate title
        -------------------------------------------------
        */

        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task title is required",
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Validate description
        -------------------------------------------------
        */

        if (
            typeof description !== "string" ||
            !description.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Task description is required",
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Validate assigned employee
        -------------------------------------------------
        */

        if (!assignedTo) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Developer or tester ID is required",
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Validate assigned role
        -------------------------------------------------
        */

        if (
            assignedToRole !== "developer" &&
            assignedToRole !== "tester"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "assignedToRole must be developer or tester",
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Validate MongoDB ID
        -------------------------------------------------
        */

        if (
            !mongoose.Types.ObjectId.isValid(
                assignedTo
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid employee ID",
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Validate priority
        -------------------------------------------------
        */

        const allowedPriorities: TaskPriority[] = [
            "low",
            "medium",
            "high",
            "urgent",
        ];

        const selectedPriority =
            priority || "medium";

        if (
            !allowedPriorities.includes(
                selectedPriority
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid task priority",
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Find logged-in manager
        -------------------------------------------------
        */
        console.log(userId);
        const manager =
            await Manager.findOne({ employeeId: userId });
        console.log(manager);
        if (!manager) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Manager not found",
                },
                { status: 404 }
            );
        }

        /*
        -------------------------------------------------
        Find developer / tester
        -------------------------------------------------
        */

        let employee = null;

        if (assignedToRole === "developer") {
            employee =
                await Developer.findById(
                    assignedTo
                )
                    .select(
                        "_id name employeeId email role"
                    )
                    .lean();
        }

        if (assignedToRole === "tester") {
            employee =
                await Tester.findById(
                    assignedTo
                )
                    .select(
                        "_id name employeeId email role"
                    )
                    .lean();
        }

        /*
        -------------------------------------------------
        Employee not found
        -------------------------------------------------
        */

        if (!employee) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        `${assignedToRole} not found`,
                },
                { status: 404 }
            );
        }

        /*
        -------------------------------------------------
        Create task
        -------------------------------------------------
        */

        const task = await Task.create({
            title: title.trim(),

            description:
                description.trim(),

            assignedBy: manager._id,

            assignedTo: employee._id,

            assignedToRole,

            employeeId:
                employee.employeeId,

            priority:
                selectedPriority,

            status: "pending",

            dueDate: dueDate
                ? new Date(dueDate)
                : undefined,
        });

        /*
        -------------------------------------------------
        Response
        -------------------------------------------------
        */

        return NextResponse.json(
            {
                success: true,

                message:
                    "Task created and assigned successfully",

                task,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(
            "Create task error:",
            error
        );

        /*
        -------------------------------------------------
        Mongoose validation error
        -------------------------------------------------
        */

        if (
            error instanceof
            mongoose.Error.ValidationError
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        error.message,
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Invalid ObjectId
        -------------------------------------------------
        */

        if (
            error instanceof
            mongoose.Error.CastError
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid employee ID",
                },
                { status: 400 }
            );
        }

        /*
        -------------------------------------------------
        Internal server error
        -------------------------------------------------
        */

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function gettask(request: NextRequest) {

    try {
        await connectDB();

        const auth =
            getManagerFromToken(request);

        if (!auth.success) {
            return auth.response;
        }

        const { userId } = auth.decoded;

        const manager = await Manager.findById(userId);

        if (!manager) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Manager not found",
                },
                { status: 404 }
            );
        }

        const tasks =
            await Task.find({
                assignedTo:
                    manager._id,
            });

        return NextResponse.json(
            {
                success: true,
                message:
                    "Tasks fetched successfully",
                tasks,
            },
            { status: 200 }
        );


    } catch (error: any) {
        console.error(
            "Get task error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error",
            },
            { status: 500 }
        );
    }

}
export async function gettaskbyassignedto(
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

        // Support employeeId from query param or from token
        const { searchParams } = new URL(request.url);
        const queryEmployeeId = searchParams.get("employeeId");
        const rawId = queryEmployeeId || decoded.userId;

        let objectIdToSearch: mongoose.Types.ObjectId | null = null;
        let employeeIdToSearch: string = rawId;

        if (mongoose.Types.ObjectId.isValid(rawId)) {
            objectIdToSearch = new mongoose.Types.ObjectId(rawId);
        } else {
            // Find corresponding Tester/Developer/Manager by employeeId to get their MongoDB _id
            const [tst, dev, mgr] = await Promise.all([
                Tester.findOne({ employeeId: rawId }).lean(),
                Developer.findOne({ employeeId: rawId }).lean(),
                Manager.findOne({ employeeId: rawId }).lean(),
            ]);

            const userDoc = tst || dev || mgr;
            if (userDoc) {
                objectIdToSearch = userDoc._id as any;
                employeeIdToSearch = userDoc.employeeId || rawId;
            }
        }

        const orConditions: any[] = [{ employeeId: employeeIdToSearch }];

        if (objectIdToSearch) {
            orConditions.push({ assignedTo: objectIdToSearch });
        }

        const tasks = await Task.find({ $or: orConditions })
            .populate("assignedBy", "name employeeId")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            {
                success: true,
                message: "Tasks fetched successfully",
                tasks,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get task by assigned error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error: " + (error?.message || ""),
            },
            { status: 500 }
        );
    }
}

export async function getalltask(request: NextRequest) {
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

        const tasks = await Task.find().sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                message: "Tasks fetched successfully",
                tasks,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Get all task error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error: " + (error?.message || ""),
            },
        );
    }
}