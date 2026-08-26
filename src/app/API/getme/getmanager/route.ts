
import { getManagerById } from "@/controllers/getemploybyid.controller";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
    request: NextRequest,
) {
    const id = request.nextUrl.searchParams.get("employeeId");


    return getManagerById(request);
}   