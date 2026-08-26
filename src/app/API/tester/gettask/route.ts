import { gettaskbyassignedto } from "@/controllers/task.controller";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return gettaskbyassignedto(request);
}

export async function POST(request: NextRequest) {
    return gettaskbyassignedto(request);
}
