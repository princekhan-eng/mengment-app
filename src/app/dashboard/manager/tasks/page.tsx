"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Briefcase,
    Search,
    Plus,
    CalendarDays,
    ChevronRight,
    Loader2,
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useAllTasks } from "@/hooks/useTasks";

function ManagerTasksContent() {
    const { data: tasks = [], isLoading: loading } = useAllTasks();
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTasks = tasks.filter((task) => {
        const matchesStatus = filterStatus === "all" || task.status === filterStatus;
        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/manager"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Briefcase className="text-indigo-400" size={22} />
                                Assigned Team Tasks
                            </h1>
                            <p className="text-xs text-slate-400">
                                Monitor all developer and tester tasks assigned across your team.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/manager/createtask"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                        >
                            <Plus size={16} />
                            Assign New Task
                        </Link>
                        <NotificationCenter currentUserId="manager_id" />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {["all", "pending", "in-progress", "completed"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                                    filterStatus === st
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                {st === "all" ? "All Tasks" : st.replace("-", " ")}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                            Loading team tasks...
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No tasks found.</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {filteredTasks.map((task) => (
                                <div key={task._id} className="p-5 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-100 text-sm">{task.title}</h3>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                            {task.description || "No description provided"}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                                            <span>Role: {task.assignedToRole || "Developer"}</span>
                                            <span>Employee ID: {task.employeeId || "N/A"}</span>
                                            <span>Status: <strong className="text-slate-300 uppercase">{task.status}</strong></span>
                                        </div>
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

export default function ManagerTasksPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <ManagerTasksContent />
        </Suspense>
    );
}
