import { getManagers } from "@/controllers/menger.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    return getManagers(request);
}
