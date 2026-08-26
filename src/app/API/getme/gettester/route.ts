import { getTesterById } from "@/controllers/getemploybyid.controller";
import { NextRequest, NextResponse } from "next/server";
export async function POST(
    request: NextRequest,
) {
    return getTesterById(request);
}