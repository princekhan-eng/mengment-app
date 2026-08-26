"use client";

import { FormEvent, useEffect, useMemo, useState, Suspense } from "react";
import axios from "axios";
import apiClient from "@/lib/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTesterTasks } from "@/hooks/useTasks";
import {
    CheckCircle2,
    Clock3,
    FileText,
    LogOut,
    Menu,
    MessageSquare,
    PlayCircle,
    TestTube2,
    X,
    AlertCircle,
    ChevronRight,
    Search,
    XCircle,
    ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import NotificationCenter from "@/components/NotificationCenter";

type TaskStatus = "pending" | "in-progress" | "completed" | "failed";

interface Task {
    _id: string;
    taskId?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: "low" | "medium" | "high" | "urgent";
    developer?: {
        _id: string;
        employeeId?: string;
        name?: string;
    };
    manager?: {
        _id: string;
        employeeId?: string;
        name?: string;
    };
    dueDate?: string;
    files?: {
        name: string;
        url: string;
    }[];
    testingResult?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Tester {
    _id: string;
    employeeId: string;
    name: string;
    email?: string;
    role?: string;
}

function TesterDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const employeeId = searchParams.get("employeeId");

    const { data: testerInfo } = useQuery({
        queryKey: ["tester", employeeId || "me"],
        queryFn: async () => {
            const res = employeeId
                ? await apiClient.get(`/API/tester/${employeeId}`).catch(() => ({ data: { success: false, tester: null } }))
                : await apiClient.get("/API/getme").catch(() => ({ data: { success: false, user: null } }));
            return res.data?.tester || res.data?.user || null;
        },
    });

    const { data: tasks = [], isLoading: loading } = useTesterTasks();
    const tester = testerInfo || null;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [testingResult, setTestingResult] = useState("");

    const logout = async () => {
        try {
            await apiClient.post("/API/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            window.location.href = "/auth/login";
        }
    };

    const queryClient = useQueryClient();

    const filteredTasks = useMemo(() => {
        return tasks.filter((task: any) => {
            const searchValue = search.toLowerCase();
            const matchesSearch =
                task.title?.toLowerCase().includes(searchValue) ||
                task.taskId?.toLowerCase().includes(searchValue) ||
                task.developer?.name?.toLowerCase().includes(searchValue);

            const matchesStatus = statusFilter === "all" || task.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, search, statusFilter]);

    const pendingTasks = tasks.filter((task) => task.status === "pending").length;
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;
    const failedTasks = tasks.filter((task: any) => task.status === "failed").length;

    const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
        try {
            setUpdatingStatus(true);
            const response = await apiClient.patch(`/API/tester/tasks/${taskId}`, {
                status,
                testingResult,
            });

            if (response.data?.success) {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                setSelectedTask((prev: any) => (prev ? { ...prev, status, testingResult } : null));
            }
        } catch (error) {
            console.error("Update task status error:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">Loading QA Tester Portal...</p>
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
                            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
                                <TestTube2 size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white text-base">TestFlow</h1>
                                <p className="text-[11px] text-slate-400">QA Tester Portal</p>
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
                                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                                    {tester?.name?.charAt(0).toUpperCase() || "T"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-white text-xs truncate">{tester?.name || "QA Tester"}</p>
                                    <p className="text-[10px] text-slate-400 truncate">ID: {tester?.employeeId || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="px-4 space-y-2 flex-1">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-600 text-white font-semibold text-xs shadow-lg shadow-amber-600/30">
                            <ShieldCheck size={18} />
                            QA Overview
                        </button>

                        <button
                            onClick={() => router.push("/dashboard/tester/tasks")}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-xs transition"
                        >
                            <FileText size={18} />
                            My Test Tasks
                        </button>

                        <button
                            onClick={() => router.push("/dashboard/tester/messages")}
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
                            <p className="text-xs text-slate-400">Quality Assurance Operations</p>
                            <h1 className="text-lg font-bold text-white">Tester Dashboard</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationCenter currentUserId={tester?._id || "tester_id"} />
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
                    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                                QA Testing Portal
                            </span>
                            <h2 className="text-2xl font-bold text-white">Welcome back, {tester?.name?.split(" ")[0] || "Tester"} 👋</h2>
                            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                                Review assigned software builds, verify completed developer features, submit test logs, and mark tasks as Passed or Failed.
                            </p>
                        </div>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">Pending Verification</p>
                                <Clock3 size={18} className="text-amber-400" />
                            </div>
                            <p className="text-2xl font-bold text-amber-400">{pendingTasks}</p>
                            <p className="text-[10px] text-slate-500">Awaiting test execution</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">In Testing</p>
                                <PlayCircle size={18} className="text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{inProgressTasks}</p>
                            <p className="text-[10px] text-slate-500">Currently being verified</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">Passed Verification</p>
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">{completedTasks}</p>
                            <p className="text-[10px] text-slate-500">Successfully verified</p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-2">
                            <div className="flex items-center justify-between text-slate-400">
                                <p className="text-xs font-medium">Failed / Bugs Found</p>
                                <XCircle size={18} className="text-rose-400" />
                            </div>
                            <p className="text-2xl font-bold text-rose-400">{failedTasks}</p>
                            <p className="text-[10px] text-slate-500">Rejected for rework</p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search test tasks by title or ID..."
                                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    statusFilter === "all"
                                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                                }`}
                            >
                                All ({tasks.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter("pending")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    statusFilter === "pending"
                                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                                }`}
                            >
                                Pending ({pendingTasks})
                            </button>
                            <button
                                onClick={() => setStatusFilter("completed")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    statusFilter === "completed"
                                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                                }`}
                            >
                                Passed ({completedTasks})
                            </button>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                            {filteredTasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">No testing tasks found.</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {filteredTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-800/40"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-slate-400">{task.taskId || "TST"}</span>
                                                    <h4 className="font-semibold text-white text-sm">{task.title}</h4>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            task.priority === "urgent" || task.priority === "high"
                                                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                                : "bg-slate-800 text-slate-300"
                                                        }`}
                                                    >
                                                        {task.priority || "medium"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-1">{task.description || "No description provided."}</p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                                        task.status === "completed"
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                            : (task.status as string) === "failed"
                                                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                            : task.status === "in-progress"
                                                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                    }`}
                                                >
                                                    {task.status}
                                                </span>
                                                <button
                                                    onClick={() => setSelectedTask(task)}
                                                    className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                                                >
                                                    View Details
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

            {/* Task Details & Status Update Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 relative">
                        <button
                            onClick={() => setSelectedTask(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                <TestTube2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">{selectedTask.title}</h3>
                                <p className="text-xs text-slate-400 font-mono">ID: {selectedTask.taskId || selectedTask._id}</p>
                            </div>
                        </div>

                        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-300 leading-relaxed">{selectedTask.description}</p>
                            {selectedTask.testingResult && (
                                <div className="border-t border-slate-800 pt-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Previous Testing Result</p>
                                    <p className="text-xs text-amber-300">{selectedTask.testingResult}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Submit Testing Notes / Log</label>
                            <textarea
                                value={testingResult}
                                onChange={(e) => setTestingResult(e.target.value)}
                                placeholder="Enter bug details or verification notes..."
                                className="w-full h-24 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                disabled={updatingStatus}
                                onClick={() => updateTaskStatus(selectedTask._id, "failed")}
                                className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition disabled:opacity-50"
                            >
                                Mark as Failed (Bug Found)
                            </button>

                            <button
                                disabled={updatingStatus}
                                onClick={() => updateTaskStatus(selectedTask._id, "completed")}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                            >
                                Mark as Passed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TesterDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="h-8 w-8 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
            </div>
        }>
            <TesterDashboardContent />
        </Suspense>
    );
}