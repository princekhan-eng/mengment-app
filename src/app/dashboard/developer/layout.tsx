import React from "react";
import CommonDashboardLayout from "@/components/dashboard/CommonDashboardLayout";

export const metadata = {
    title: "DevPanel | Software Engineering Portal",
    description: "Manage development tasks, track sprint progress, and submit deliverables",
};

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    return <CommonDashboardLayout role="developer">{children}</CommonDashboardLayout>;
}
