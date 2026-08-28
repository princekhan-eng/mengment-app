import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: process.env.GOOGLE_ACCESS_TOKEN,
    },
});

export const sendEmail = async (
    to: string,
    subject: string,
    html: string
) => {
    try {
        const info = await transporter.sendMail({
            from: `"ManageHub" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent:", info.messageId);

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error: any) {
        console.error("Email sending failed:", error);
        throw new Error(error?.message || "Failed to send email");
    }
};