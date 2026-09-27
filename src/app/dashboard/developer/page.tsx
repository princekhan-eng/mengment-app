"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    CheckCircle2,
    Clock3,
    FileText,
    PlayCircle,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDeveloperTasks } from "@/hooks/useTasks";

interface Developer {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
}

interface DeveloperResponse {
    success: boolean;
    developer: Developer;
}

export default function DeveloperDashboard() {
    const router = useRouter();

    const { data: devInfo } = useQuery({
        queryKey: ["developer", "me"],
        queryFn: async () => {
            const res = await axios.get<DeveloperResponse>("/API/developer/me");
            return res.data?.developer || null;
        },
    });

    const { data: rawTasks = [], isLoading: loading } = useDeveloperTasks();
    const developer = devInfo || null;

    // Deduplicate tasks
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

    const pendingTasks = tasks.filter((task) => task.status === "pending").length;
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;
    const urgentTasks = tasks.filter((task) => task.priority === "urgent" || task.priority === "high").length;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
                <div className="text-center space-y-3 p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="h-10 w-10 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-semibold">Loading developer portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 p-6 shadow-xs relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                                Developer Portal
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back, {developer?.name?.split(" ")[0] || "Developer"} 👋</h2>
                            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                                Review assigned sprint tasks, update implementation progress, upload build proofs, and collaborate with your team.
                            </p>
                        </div>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">Pending Tasks</p>
                                <Clock3 size={16} className="text-amber-500" />
                            </div>
                            <p className="text-2xl font-bold text-amber-600">{pendingTasks}</p>
                            <p className="text-[10px] text-slate-400">Awaiting initiation</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">In Progress</p>
                                <PlayCircle size={16} className="text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                            <p className="text-[10px] text-slate-400">Currently active code</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">Completed Tasks</p>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
                            <p className="text-[10px] text-slate-400">Verified & finished</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                                <p className="text-xs font-semibold">Urgent Priority</p>
                                <AlertCircle size={16} className="text-rose-500" />
                            </div>
                            <p className="text-2xl font-bold text-rose-600">{urgentTasks}</p>
                            <p className="text-[10px] text-slate-400">High priority items</p>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" />
                                    Assigned Developer Tasks
                                </h3>
                                <p className="text-xs text-slate-500">Tasks assigned to you by project leadership.</p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/developer/tasks")}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-1 shadow-xs"
                            >
                                View All Tasks
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                            {tasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-xs">No tasks assigned yet.</div>
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
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border capitalize ${
                                                    task.priority === "urgent"
                                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                                        : task.priority === "high"
                                                        ? "bg-orange-50 text-orange-700 border-orange-200"
                                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                                }`}>
                                                    {task.priority}
                                                </span>
                                                <button
                                                    onClick={() => router.push("/dashboard/developer/tasks")}
                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition shadow-xs"
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
        </div>
    );
}