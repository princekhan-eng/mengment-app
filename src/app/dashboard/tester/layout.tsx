import React from "react";
import CommonDashboardLayout from "@/components/dashboard/CommonDashboardLayout";

export const metadata = {
    title: "QAPortal | Quality Assurance & Testing Control",
    description: "Execute QA test plans, log bugs, and certify software releases",
};

export default function TesterLayout({ children }: { children: React.ReactNode }) {
    return <CommonDashboardLayout role="tester">{children}</CommonDashboardLayout>;
}
