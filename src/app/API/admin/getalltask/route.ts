import { getalltask } from "@/controllers/task.controller";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return await getalltask(request);
}