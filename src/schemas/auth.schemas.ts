import { z } from "zod";

/* =========================================
   LOGIN
========================================= */

const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

export type LoginSchema =
    z.infer<typeof loginSchema>;


/* =========================================
   REGISTER
========================================= */

const registerSchema = z
    .object({
        name: z
            .string()
            .min(3, "Name must be at least 3 characters")
            .trim(),

        email: z
            .string()
            .email("Invalid email")
            .trim()
            .toLowerCase(),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),

        confirmPassword: z
            .string()
            .min(6, "Confirm password must be at least 6 characters"),

        role: z.enum([
            "developer",
            "tester",
            "manager",
            "admin",
        ]),
    })
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

export type RegisterSchema =
    z.infer<typeof registerSchema>;


/* =========================================
   FORGOT PASSWORD
========================================= */

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .email("Invalid email")
        .trim()
        .toLowerCase(),
});

export type ForgotPasswordSchema =
    z.infer<typeof forgotPasswordSchema>;


/* =========================================
   RESET PASSWORD
========================================= */

const resetPasswordSchema = z
    .object({
        email: z
            .string()
            .email("Invalid email")
            .trim()
            .toLowerCase(),

        oldPassword: z
            .string()
            .min(6, "Old password must be at least 6 characters"),

        password: z
            .string()
            .min(6, "New password must be at least 6 characters"),

        confirmPassword: z
            .string()
            .min(6, "Confirm password must be at least 6 characters"),
    })
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

export type ResetPasswordSchema =
    z.infer<typeof resetPasswordSchema>;


/* =========================================
   UPDATE PASSWORD
========================================= */

const updatePasswordSchema = z
    .object({
        email: z
            .string()
            .email("Invalid email")
            .trim()
            .toLowerCase(),

        password: z
            .string()
            .min(6, "New password must be at least 6 characters"),

        confirmPassword: z
            .string()
            .min(6, "Confirm password must be at least 6 characters"),
    })
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

export type UpdatePasswordSchema =
    z.infer<typeof updatePasswordSchema>;


/* =========================================
   EXPORT
========================================= */

export {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updatePasswordSchema,
};