import { NextRequest, NextResponse } from "next/server";
import { getdevlopers } from "@/controllers/menger.controller";

export async function GET(request: NextRequest) {
    return getdevlopers(request)
}   
