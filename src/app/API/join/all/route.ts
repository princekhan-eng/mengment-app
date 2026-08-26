import { JOIN_TEAM } from "@/controllers/join.controller"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    return await JOIN_TEAM(request)
}
