import { updatepassword } from "@/controllers/auth.controller";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    return await updatepassword(req);
}