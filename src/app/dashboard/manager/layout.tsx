import React from "react";
import CommonDashboardLayout from "@/components/dashboard/CommonDashboardLayout";

export const metadata = {
    title: "ManagerHub | Team Leadership & Sprint Operations",
    description: "Assign sprint tasks, manage developers, and oversee project execution",
};

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
    return <CommonDashboardLayout role="manager">{children}</CommonDashboardLayout>;
}
