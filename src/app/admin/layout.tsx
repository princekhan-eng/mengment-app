import React from "react";
import CommonDashboardLayout from "@/components/dashboard/CommonDashboardLayout";

export const metadata = {
    title: "AdminHub | System Control Center",
    description: "Company-wide administration, employee provisioning, and task audit controls",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <CommonDashboardLayout role="admin">{children}</CommonDashboardLayout>;
}
