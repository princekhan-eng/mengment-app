export const otpEmailTemplate = (
    name: string,
    otp: string
) => {
    return `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">

            <h2>Hello ${name},</h2>

            <p>Your verification OTP is:</p>

            <h1
                style="
                    letter-spacing: 8px;
                    background: #f3f4f6;
                    padding: 15px;
                    display: inline-block;
                "
            >
                ${otp}
            </h1>

            <p>This OTP will expire in <strong>10 minutes</strong>.</p>

            <p>If you did not request this code, please ignore this email.</p>

            <br>

            <p>Thanks,<br>My App Team</p>

        </body>
        </html>
    `;
};