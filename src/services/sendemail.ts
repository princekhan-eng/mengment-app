import { sendEmail } from "./transpoter";
import { otpEmailTemplate } from "./emailTemplates";

export const sendOTPEmail = async (to: string, name: string, otp: string) => {
    const html = otpEmailTemplate(name, otp);
    return await sendEmail(to, "Your ManageHub Verification Code (OTP)", html);
};
