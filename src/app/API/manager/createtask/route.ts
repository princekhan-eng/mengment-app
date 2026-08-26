import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/controllers/task.controller";

export async function POST(request: NextRequest) {
    return await createTask(request);
}