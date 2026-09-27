"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Shield,
    Briefcase,
    Code2,
    Bug,
    Users,
    UserCheck,
    PlusCircle,
    CheckSquare,
    ListTodo,
    Clock,
    History,
    MessageSquare,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    Sparkles,
    FolderKanban,
    ClipboardCheck,
    Activity,
    ShieldCheck,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import NotificationCenter from "@/components/NotificationCenter";

export type DashboardRole = "admin" | "manager" | "developer" | "tester";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

interface CommonDashboardLayoutProps {
    role: DashboardRole;
    children: React.ReactNode;
}

export default function CommonDashboardLayout({
    role,
    children,
}: CommonDashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{
        name?: string;
        email?: string;
        employeeId?: string;
        id?: string;
        _id?: string;
        role?: string;
    } | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Fetch authenticated user info
    useEffect(() => {
        let isMounted = true;
        const fetchMe = async () => {
            try {
                const res = await apiClient.get("/API/getme");
                if (isMounted && res.data?.success && res.data?.user) {
                    setUser(res.data.user);
                }
            } catch (err) {
                // Non-critical fallback
            } finally {
                if (isMounted) setLoadingUser(false);
            }
        };
        fetchMe();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = async () => {
        try {
            await apiClient.post("/API/auth/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            router.push("/auth/login");
        }
    };

    // Role configuration: Branding, Colors, and Navigation
    const roleConfig = useMemo(() => {
        switch (role) {
            case "admin":
                return {
                    brandName: "AdminHub",
                    brandSubtitle: "System Control Center",
                    brandIcon: Shield,
                    accentGradient: "from-rose-600 to-pink-500",
                    accentBg: "bg-rose-50 text-rose-700 border-rose-200/80",
                    accentGlow: "shadow-rose-500/20",
                    activeNavClass:
                        "bg-rose-50 text-rose-700 font-semibold border border-rose-200/80 shadow-xs",
                    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
                    roleLabel: "System Administrator",
                    sections: [
                        {
                            title: "Overview",
                            items: [
                                {
                                    label: "Dashboard Overview",
                                    href: "/admin",
                                    icon: Activity,
                                },
                            ],
                        },
                        {
                            title: "Team Provisioning",
                            items: [
                                {
                                    label: "All Employees",
                                    href: "/admin/employees",
                                    icon: Users,
                                },
                                {
                                    label: "Create Manager",
                                    href: "/admin/createmanager",
                                    icon: UserCheck,
                                },
                                {
                                    label: "Create Developer",
                                    href: "/admin/createdeveloper",
                                    icon: Code2,
                                },
                                {
                                    label: "Create QA Tester",
                                    href: "/admin/createtester",
                                    icon: Bug,
                                },
                            ],
                        },
                        {
                            title: "Tasks & Audits",
                            items: [
                                {
                                    label: "All Company Tasks",
                                    href: "/admin/tasks",
                                    icon: ListTodo,
                                },
                                {
                                    label: "Today's Tasks",
                                    href: "/admin/tasks/today",
                                    icon: Clock,
                                },
                                {
                                    label: "Task History & Logs",
                                    href: "/admin/tasks/history",
                                    icon: History,
                                },
                            ],
                        },
                        {
                            title: "Workspace",
                            items: [
                                {
                                    label: "Team Messages",
                                    href: "/admin/messages",
                                    icon: MessageSquare,
                                },
                            ],
                        },
                    ] as NavSection[],
                };

            case "manager":
                return {
                    brandName: "ManagerHub",
                    brandSubtitle: "Team Leader Operations",
                    brandIcon: Briefcase,
                    accentGradient: "from-indigo-600 to-blue-600",
                    accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
                    accentGlow: "shadow-indigo-600/20",
                    activeNavClass:
                        "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs",
                    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
                    roleLabel: "Team Manager",
                    sections: [
                        {
                            title: "Overview",
                            items: [
                                {
                                    label: "Manager Dashboard",
                                    href: "/dashboard/manager",
                                    icon: Activity,
                                },
                            ],
                        },
                        {
                            title: "Team Members",
                            items: [
                                {
                                    label: "Assigned Developers",
                                    href: "/dashboard/manager/developers",
                                    icon: Code2,
                                },
                                {
                                    label: "QA Testers",
                                    href: "/dashboard/manager/testers",
                                    icon: ShieldCheck,
                                },
                            ],
                        },
                        {
                            title: "Sprint Management",
                            items: [
                                {
                                    label: "Assign New Task",
                                    href: "/dashboard/manager/createtask",
                                    icon: PlusCircle,
                                },
                                {
                                    label: "Team Tasks Overview",
                                    href: "/dashboard/manager/tasks",
                                    icon: ListTodo,
                                },
                            ],
                        },
                        {
                            title: "Workspace",
                            items: [
                                {
                                    label: "Team Messages",
                                    href: "/dashboard/manager/messages",
                                    icon: MessageSquare,
                                },
                            ],
                        },
                    ] as NavSection[],
                };

            case "developer":
                return {
                    brandName: "DevPanel",
                    brandSubtitle: "Software Engineer Portal",
                    brandIcon: Code2,
                    accentGradient: "from-blue-600 to-indigo-600",
                    accentBg: "bg-blue-50 text-blue-700 border-blue-200/80",
                    accentGlow: "shadow-blue-600/20",
                    activeNavClass:
                        "bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-xs",
                    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
                    roleLabel: "Software Developer",
                    sections: [
                        {
                            title: "Overview",
                            items: [
                                {
                                    label: "Dashboard Overview",
                                    href: "/dashboard/developer",
                                    icon: FolderKanban,
                                },
                            ],
                        },
                        {
                            title: "Engineering Tasks",
                            items: [
                                {
                                    label: "My Assigned Tasks",
                                    href: "/dashboard/developer/tasks",
                                    icon: CheckSquare,
                                },
                            ],
                        },
                        {
                            title: "Workspace",
                            items: [
                                {
                                    label: "Team Messages",
                                    href: "/dashboard/developer/messages",
                                    icon: MessageSquare,
                                },
                            ],
                        },
                    ] as NavSection[],
                };

            case "tester":
                return {
                    brandName: "QAPortal",
                    brandSubtitle: "Quality Assurance Control",
                    brandIcon: Bug,
                    accentGradient: "from-amber-600 to-orange-500",
                    accentBg: "bg-amber-50 text-amber-800 border-amber-200/80",
                    accentGlow: "shadow-amber-600/20",
                    activeNavClass:
                        "bg-amber-50 text-amber-800 font-semibold border border-amber-200/80 shadow-xs",
                    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
                    roleLabel: "QA Engineer",
                    sections: [
                        {
                            title: "Overview",
                            items: [
                                {
                                    label: "QA Overview",
                                    href: "/dashboard/tester",
                                    icon: ShieldCheck,
                                },
                            ],
                        },
                        {
                            title: "Verification Queue",
                            items: [
                                {
                                    label: "My Test Tasks",
                                    href: "/dashboard/tester/tasks",
                                    icon: ClipboardCheck,
                                },
                            ],
                        },
                        {
                            title: "Workspace",
                            items: [
                                {
                                    label: "Team Messages",
                                    href: "/dashboard/tester/messages",
                                    icon: MessageSquare,
                                },
                            ],
                        },
                    ] as NavSection[],
                };
        }
    }, [role]);

    const BrandIcon = roleConfig.brandIcon;

    // Helper for active navigation link
    const isItemActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        if (href === "/dashboard/manager") return pathname === "/dashboard/manager";
        if (href === "/dashboard/developer") return pathname === "/dashboard/developer";
        if (href === "/dashboard/tester") return pathname === "/dashboard/tester";
        return pathname.startsWith(href);
    };

    // Calculate dynamic page title / breadcrumbs
    const currentTitle = useMemo(() => {
        for (const sec of roleConfig.sections) {
            for (const item of sec.items) {
                if (isItemActive(item.href)) {
                    return item.label;
                }
            }
        }
        return `${roleConfig.brandName} Console`;
    }, [pathname, roleConfig]);

    const displayName = user?.name || roleConfig.roleLabel;
    const initialLetter = displayName.charAt(0).toUpperCase();

    // Reusable Sidebar Content
    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-white">
            {/* Brand Logo & Title */}
            <div className="flex h-18 sm:h-20 items-center justify-between border-b border-slate-100 px-6">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${roleConfig.accentGradient} text-white font-bold shadow-md ${roleConfig.accentGlow}`}
                    >
                        <BrandIcon size={20} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-slate-900 text-base tracking-tight">
                            {roleConfig.brandName}
                        </h2>
                        <p className="text-[10px] text-slate-400 font-medium">
                            {roleConfig.brandSubtitle}
                        </p>
                    </div>
                </div>

                {/* Close Button for Mobile Drawer */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
                    title="Close Navigation"
                >
                    <X size={20} />
                </button>
            </div>

            {/* User Profile Summary Card */}
            <div className="p-4 border-b border-slate-100/80">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/70 p-3 shadow-2xs">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${roleConfig.accentGradient} text-white font-bold text-sm shadow-xs`}
                    >
                        {initialLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-xs truncate">
                                {displayName}
                            </p>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                            {user?.employeeId ? `ID: ${user.employeeId}` : roleConfig.roleLabel}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-5 p-4 overflow-y-auto">
                {roleConfig.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-1">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            {sec.title}
                        </p>
                        <div className="space-y-1">
                            {sec.items.map((item) => {
                                const ItemIcon = item.icon;
                                const active = isItemActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-all ${
                                            active
                                                ? roleConfig.activeNavClass
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <ItemIcon
                                                size={16}
                                                className={
                                                    active
                                                        ? "text-inherit"
                                                        : "text-slate-400 group-hover:text-slate-600"
                                                }
                                            />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        {active && (
                                            <ChevronRight
                                                size={14}
                                                className="shrink-0 text-slate-400"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Section with Logout */}
            <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white text-rose-600 border border-rose-200/70 text-xs font-semibold hover:bg-rose-50 hover:border-rose-300 transition shadow-2xs"
                >
                    <LogOut size={15} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:flex lg:translate-x-0 ${
                    mobileOpen ? "flex translate-x-0 shadow-2xl" : "hidden lg:flex -translate-x-full"
                }`}
            >
                <SidebarContent />
            </aside>

            {/* Main Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Unified Common Top Sticky Header */}
                <header className="sticky top-0 z-30 flex h-18 sm:h-20 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 sm:px-6 backdrop-blur-md lg:px-8">
                    {/* Left: Mobile Toggle & Page Title / Breadcrumb */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 lg:hidden shadow-2xs"
                            title="Open Navigation"
                        >
                            <Menu size={18} />
                        </button>

                        <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hidden sm:flex">
                                <span>{roleConfig.brandName}</span>
                                <span>/</span>
                                <span className="text-slate-600">{roleConfig.brandSubtitle}</span>
                            </div>
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                {currentTitle}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Role Pill, Notification Center & Profile Mini */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5">
                        {/* Role Indicator Pill */}
                        <span
                            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider shadow-2xs ${roleConfig.badgeColor}`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {role}
                        </span>

                        {/* Common Notification Center */}
                        <NotificationCenter
                            currentUserId={user?.id || user?._id || `${role}_user`}
                        />

                        {/* User Profile Avatar with Direct Logout Link */}
                        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${roleConfig.accentGradient} text-white font-bold text-xs shadow-xs`}
                                title={displayName}
                            >
                                {initialLetter}
                            </div>
                            <div className="hidden xl:block text-left">
                                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                                    {displayName}
                                </p>
                                <p className="text-[10px] text-slate-400 capitalize">
                                    {role}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
