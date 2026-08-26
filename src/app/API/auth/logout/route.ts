import { Logout } from "@/controllers/auth.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    return await Logout(req);
}
export async function GET(req: NextRequest) {
    return await Logout(req);
}