import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/connectdb";
import Developer from "@/models/developer.model";
import Manager from "@/models/menager.model";
import Tester from "@/models/tester.model";



/* =========================================================
   GET DEVELOPER BY ID
   GET /API/getemply/developer/:id
========================================================= */

export async function getDeveloperById(
    request: NextRequest,
    id?: string
) {
    try {
        await connectDB();

        const devId = id || request.nextUrl.searchParams.get("employeeId") || request.url.split("/").pop();

        if (!devId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Developer ID is required",
                },
                { status: 400 }
            );
        }



        const developer = await (mongoose.Types.ObjectId.isValid(devId)
            ? Developer.findById(devId)
            : Developer.findOne({ employeeId: devId }))
            .select("-password")
            .lean();

        if (!developer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Developer not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                developer,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(
            "Get developer by ID error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error " +
                    error.message,
            },
            { status: 500 }
        );
    }
}


/* =========================================================
   GET MANAGER BY ID
   GET /API/getemply/manager/:id
========================================================= */

export async function getManagerById(
    request: NextRequest,
) {
    try {
        await connectDB();
        const id = request.nextUrl.searchParams.get("employeeId") || request.url.split("/").pop();

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Manager ID is required",
                },
                { status: 400 }
            );
        }

        const queryConditions: any[] = [{ employeeId: id }];
        if (mongoose.Types.ObjectId.isValid(id)) {
            queryConditions.push({ _id: id });
        }

        const manager = await Manager.findOne({ $or: queryConditions })
            .select("-password")
            .lean();

        if (!manager) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Manager not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                manager,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(
            "Get manager by ID error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error " +
                    error.message,
            },
            { status: 500 }
        );
    }
}


/* =========================================================
   GET TESTER BY ID
   GET /API/getemply/tester/:id
========================================================= */

export async function getTesterById(
    request: NextRequest,
) {
    try {
        await connectDB();
        const Id = request.nextUrl.searchParams.get("employeeId") || request.url.split("/").pop();

        if (!Id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tester ID is required",
                },
                { status: 400 }
            );
        }

        const queryConditions: any[] = [{ employeeId: Id }];
        if (mongoose.Types.ObjectId.isValid(Id)) {
            queryConditions.push({ _id: Id });
        }

        const tester = await Tester.findOne({ $or: queryConditions })
            .select("-password")
            .lean();

        if (!tester) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tester not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                tester,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(
            "Get tester by ID error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error " +
                    error.message,
            },
            { status: 500 }
        );
    }
}


/* =========================================================
   GET CURRENT EMPLOYEE
========================================================= */
// export const getme = async (
//     request: NextRequest,


// ) => {
//     try {
//         await connectDB();



//         let employee = null;

//         /* =========================
//            DEVELOPER
//         ========================= */

//         if (role === "developer") {
//             employee =
//                 await Developer.findOne({
//                     employeeId: id,
//                 })
//                     .select("-password")
//                     .lean();
//         }

//         /* =========================
//            MANAGER
//         ========================= */

//         else if (role === "manager") {
//             employee =
//                 await Manager.findOne({
//                     employeeId: id,
//                 })
//                     .select("-password")
//                     .lean();
//         }

//         /* =========================
//            TESTER
//         ========================= */

//         else if (role === "tester") {
//             employee =
//                 await Tester.findOne({
//                     employeeId: id,
//                 })
//                     .select("-password")
//                     .lean();
//         }

//         /* =================================================
//            INVALID ROLE
//         ================================================= */

//         else {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid employee role",
//                 },
//                 {
//                     status: 400,
//                 }
//             );
//         }

//         /* =================================================
//            EMPLOYEE NOT FOUND
//         ================================================= */

//         if (!employee) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Employee not found",
//                 },
//                 {
//                     status: 404,
//                 }
//             );
//         }

//         /* =================================================
//            SUCCESS
//         ================================================= */

//         return NextResponse.json(
//             {
//                 success: true,
//                 employee,
//             },
//             {
//                 status: 200,
//             }
//         );
//     } catch (error: any) {
//         console.error(
//             "Get employee error:",
//             error
//         );

//         return NextResponse.json(
//             {
//                 success: false,
//                 message: "Internal server error",
//             },
//             {
//                 status: 500,
//             }
//         );
//     }
// };

