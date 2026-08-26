import { getTester } from "@/controllers/tester.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    return getTester(request)
}
