import { NextResponse } from "next/server";

export type UserRole =
    | "developer"
    | "tester"
    | "manager"
    | "admin";

const ROLE_DASHBOARDS: Record<UserRole, string> = {
    developer: "/dashboard/developer",
    tester: "/dashboard/tester",
    manager: "/dashboard/manager",
    admin: "/dashboard/admin",
};

export function loginRoleMiddleware(role: string) {
    const dashboard = ROLE_DASHBOARDS[role as UserRole];

    if (!dashboard) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid user role",
            },
            { status: 403 }
        );
    }

    return NextResponse.json({
        success: true,
        redirectTo: dashboard,
    });
}