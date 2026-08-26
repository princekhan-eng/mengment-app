import { gettaskbyassignedto } from "@/controllers/task.controller";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return await gettaskbyassignedto(request);
}
