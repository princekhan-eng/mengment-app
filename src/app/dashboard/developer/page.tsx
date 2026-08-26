"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    CheckCircle2,
    Clock3,
    Code2,
    FileText,
    FolderKanban,
    LogOut,
    Menu,
    MessageSquare,
    PlayCircle,
    UserRound,
    X,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationCenter from "@/components/NotificationCenter";

interface Developer {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
}

interface Task {
    _id: string;
    taskId: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in-progress" | "completed";
    dueDate?: string;
    createdAt: string;
    manager?: {
        _id: string;
        name: string;
        employeeId: string;
    };
}

interface DeveloperResponse {
    success: boolean;
    developer: Developer;
}

interface TasksResponse {
    success: boolean;
    tasks: Task[];
}

import { useQuery } from "@tanstack/react-query";
import { useDeveloperTasks } from "@/hooks/useTasks";

export default function DeveloperDashboard() {
    const router = useRouter();

    const { data: devInfo } = useQuery({
        queryKey: ["developer", "me"],
        queryFn: async () => {
            const res = await axios.get<DeveloperResponse>("/API/developer/me");
            return res.data?.developer || null;
        },
    });

    const { data: tasks = [], isLoading: loading } = useDeveloperTasks();
    const developer = devInfo || null;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logout = async () => {
        try {
            await axios.post("/API/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            window.location.href = "/auth/login";
        }
    };

    const pendingTasks = tasks.filter((task) => task.status === "pending").length;
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;
    const urgentTasks = tasks.filter((task) => task.priority === "urgent" || task.priority === "high").length;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">Loading developer portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50
                    h-screen w-72 bg-slate-900 border-r border-slate-800
                    transform transition-transform duration-300
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                                <Code2 size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white text-base">DevPanel</h1>
                                <p className="text-[11px] text-slate-400">Developer Portal</p>
                            </div>
                        </div>

                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Profile */}
                    <div className="p-5">
                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                    {developer?.name?.charAt(0).toUpperCase() || "D"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-white text-xs truncate">{developer?.name || "Developer"}</p>
                                    <p className="text-[10px] text-slate-400 truncate">ID: {developer?.employeeId || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="px-4 space-y-2 flex-1">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30">
                            <FolderKanban size={18} />
                            Dashboard Overview
                        </button>

                        <button
                            onClick={() => router.push("/dashboard/developer/tasks")}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-xs transition"
                        >
                            <FileText size={18} />
                            My Tasks
                        </button>

                        <button
                            onClick={() => router.push("/dashboard/developer/messages")}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-xs transition"
                        >
                            <MessageSquare size={18} />
                            Team Workspace Chat
                        </button>
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-600 hover:text-white transition"
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 lg:pl-0 min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur lg:px-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="text-xs text-slate-400">Software Engineering Operations</p>
                            <h1 className="text-lg font-bold text-white">Developer Dashboard</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationCenter currentUserId={developer?._id || "dev_id"} />
                        <button
                            onClick={logout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition"
                        >
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                                Developer Portal
                            </span>
                            <h2 className="text-2xl font-bold text-white">Welcome back, {developer?.name?.split(" ")[0] || "Developer"} 👋</h2>
                            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                                Review assigned sprint tasks, update implementation progress, upload build proofs, and collaborate with your team.
                            </p>
                        </div>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">Pending Tasks</p>
                                <Clock3 size={18} className="text-amber-400" />
                            </div>
                            <p className="text-2xl font-bold text-amber-400">{pendingTasks}</p>
                            <p className="text-[10px] text-slate-500">Awaiting initiation</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">In Progress</p>
                                <PlayCircle size={18} className="text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{inProgressTasks}</p>
                            <p className="text-[10px] text-slate-500">Currently active code</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">Completed Tasks</p>
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">{completedTasks}</p>
                            <p className="text-[10px] text-slate-500">Verified & finished</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">Urgent / High Priority</p>
                                <AlertCircle size={18} className="text-rose-400" />
                            </div>
                            <p className="text-2xl font-bold text-rose-400">{urgentTasks}</p>
                            <p className="text-[10px] text-slate-500">High priority items</p>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <FileText size={18} className="text-emerald-400" />
                                    Assigned Developer Tasks
                                </h3>
                                <p className="text-xs text-slate-400">Tasks assigned to you by project leadership.</p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/developer/tasks")}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition flex items-center gap-1.5"
                            >
                                View All Tasks
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                            {tasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">No tasks assigned yet.</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {tasks.slice(0, 6).map((task) => (
                                        <div key={task._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-800/40">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-slate-400">{task.taskId || "TASK"}</span>
                                                    <h4 className="font-semibold text-white text-sm">{task.title}</h4>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            task.priority === "urgent" || task.priority === "high"
                                                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                                : "bg-slate-800 text-slate-300"
                                                        }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-1">{task.description || "No description provided."}</p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                                        task.status === "completed"
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                            : task.status === "in-progress"
                                                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                    }`}
                                                >
                                                    {task.status}
                                                </span>
                                                <button
                                                    onClick={() => router.push("/dashboard/developer/tasks")}
                                                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                                                >
                                                    Manage Task
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}