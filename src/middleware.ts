import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface TokenPayload {
    userId?: string;
    role?: string;
    exp?: number;
}

const ROLE_DASHBOARDS: Record<string, string> = {
    admin: "/admin",
    manager: "/dashboard/manager",
    developer: "/dashboard/developer",
    tester: "/dashboard/tester",
};

function parseJwt(token: string): TokenPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static files, Next.js internal assets, socket.io
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/socket.io") ||
        pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    let activeUserRole: string | null = null;
    let isValidAccess = false;
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (accessToken) {
        const decoded = parseJwt(accessToken);
        if (decoded && decoded.exp && decoded.exp > nowInSeconds && decoded.role) {
            activeUserRole = decoded.role;
            isValidAccess = true;
        }
    }

    // Fallback to refresh token if access token is missing or expired
    if (!isValidAccess && refreshToken) {
        const decodedRefresh = parseJwt(refreshToken);
        if (
            decodedRefresh &&
            decodedRefresh.exp &&
            decodedRefresh.exp > nowInSeconds &&
            decodedRefresh.role
        ) {
            activeUserRole = decodedRefresh.role;
            isValidAccess = true;
        }
    }

    // If logged in user tries to visit auth pages (/auth/login, /auth/register), redirect to their dashboard
    if (isValidAccess && activeUserRole && pathname.startsWith("/auth/")) {
        const targetDashboard = ROLE_DASHBOARDS[activeUserRole] || "/admin";
        return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // Allow auth pages and public API auth endpoints
    if (pathname.startsWith("/auth/") || pathname.startsWith("/API/auth/")) {
        return NextResponse.next();
    }

    // Protect dashboard and admin routes
    if (!isValidAccess && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/auth/:path*",
        "/API/:path*",
    ],
};
