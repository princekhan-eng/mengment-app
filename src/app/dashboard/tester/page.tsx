"use client";

import { FormEvent, useEffect, useMemo, useState, Suspense } from "react";
import axios from "axios";
import apiClient from "@/lib/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTesterTasks } from "@/hooks/useTasks";
import {
    CheckCircle2,
    Clock3,
    PlayCircle,
    AlertCircle,
    ChevronRight,
    Search,
    XCircle,
    Bug,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

    const { data: rawTasks = [], isLoading: loading } = useTesterTasks();
    const tester = testerInfo || null;

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [testingResult, setTestingResult] = useState("");

    const queryClient = useQueryClient();

    // Deduplicate
    const tasks = useMemo(() => {
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const t of rawTasks) {
            const key = t._id || t.taskId;
            if (key && !seen.has(key)) {
                seen.add(key);
                deduped.push(t);
            }
        }
        return deduped;
    }, [rawTasks]);

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
    const urgentTasks = tasks.filter((task: any) => task.priority === "urgent" || task.priority === "high").length;

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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
                <div className="text-center space-y-3 p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="h-10 w-10 border-3 border-slate-200 border-t-amber-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">Loading QA Tester Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Quick Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">QA Testing Dashboard</h1>
                    <p className="text-xs text-slate-500">Quality assurance, bug verification, and sprint test execution.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/dashboard/tester/tasks")}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shadow-xs flex items-center gap-1.5"
                    >
                        <Bug size={14} />
                        Active Tasks ({pendingTasks + inProgressTasks})
                    </button>
                </div>
            </div>

            {/* Welcome Banner */}
                    <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/40 p-6 shadow-xs relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                                QA Verification Center
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back, {tester?.name?.split(" ")[0] || "Tester"} 👋</h2>
                            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                                Review developer builds, conduct functional tests, record verification bug notes, and communicate test verdicts.
                            </p>
                        </div>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">Pending QA</p>
                                <Clock3 size={16} className="text-amber-500" />
                            </div>
                            <p className="text-2xl font-bold text-amber-600">{pendingTasks}</p>
                            <p className="text-[10px] text-slate-400">Awaiting test start</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">In Testing</p>
                                <PlayCircle size={16} className="text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                            <p className="text-[10px] text-slate-400">Currently executing</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">Passed & Completed</p>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
                            <p className="text-[10px] text-slate-400">Verified working</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">High Priority</p>
                                <AlertCircle size={16} className="text-rose-500" />
                            </div>
                            <p className="text-2xl font-bold text-rose-600">{urgentTasks}</p>
                            <p className="text-[10px] text-slate-400">Urgent verifications</p>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Bug size={18} className="text-amber-600" />
                                    QA Task Queue
                                </h3>
                                <p className="text-xs text-slate-500">Sprint features assigned for verification.</p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/tester/tasks")}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition flex items-center gap-1 shadow-xs"
                            >
                                View All Tasks
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                            {tasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-xs">No tasks in QA queue.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {tasks.slice(0, 6).map((task) => (
                                        <div key={task._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/70">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        #{task.taskId || "TASK"}
                                                    </span>
                                                    <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                            task.status === "completed"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : task.status === "in-progress"
                                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                                        }`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1">{task.description || "No description provided."}</p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    onClick={() => router.push("/dashboard/tester/tasks")}
                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition shadow-xs"
                                                >
                                                    Perform QA
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            </div>
    );
}

export default function TesterDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading QA Portal...
            </div>
        }>
            <TesterDashboardContent />
        </Suspense>
    );
}