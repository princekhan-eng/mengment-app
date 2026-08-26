import { getDeveloperById } from "@/controllers/getemploybyid.controller";
import { NextRequest, NextResponse } from "next/server";
/* =========================================================
   GET REQUEST
========================================================= */

export async function POST(
    request: NextRequest,
) {




    return getDeveloperById(request);
}




