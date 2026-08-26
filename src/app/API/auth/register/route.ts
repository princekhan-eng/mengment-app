"use server";

import { NextRequest } from "next/server";
import { Register } from "@/controllers/auth.controller";

export async function POST(req: NextRequest) {
    return await Register(req);
}