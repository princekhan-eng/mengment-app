import jwt from "jsonwebtoken";

export type UserRole =
    | "admin"
    | "manager"
    | "developer"
    | "tester";

export interface TokenPayload {
    userId: string;
    role: UserRole;

}

/* =========================
   GENERATE ACCESS TOKEN
========================= */

export const generateAccessToken = (
    payload: TokenPayload
): string => {
    const secret =
        process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "ACCESS_TOKEN_SECRET is not defined"
        );
    }

    return jwt.sign(payload, secret, {
        expiresIn: "15m",
    });
};


/* =========================
   GENERATE REFRESH TOKEN
========================= */

export const generateRefreshToken = (
    payload: TokenPayload
): string => {
    const secret =
        process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "REFRESH_TOKEN_SECRET is not defined"
        );
    }

    return jwt.sign(payload, secret, {
        expiresIn: "7d",
    });
};


/* =========================
   VERIFY ACCESS TOKEN
========================= */

export const verifyAccessToken = (
    token: string
): TokenPayload => {
    const secret =
        process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "ACCESS_TOKEN_SECRET is not defined"
        );
    }

    return jwt.verify(
        token,
        secret
    ) as TokenPayload;
};


/* =========================
   VERIFY REFRESH TOKEN
========================= */

export const verifyRefreshToken = (
    token: string
): TokenPayload => {
    const secret =
        process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
        throw new Error(
            "REFRESH_TOKEN_SECRET is not defined"
        );
    }

    return jwt.verify(
        token,
        secret
    ) as TokenPayload;
};