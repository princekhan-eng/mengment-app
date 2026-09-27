"use client";

import React, { Suspense, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CalendarDays, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useAllTasks } from "@/hooks/useTasks";

function AdminTasksTodayContent() {
    const { data: allTasks = [], isLoading: loading } = useAllTasks();
    const todayStr = new Date().toISOString().split("T")[0];

    // Filter today's tasks
    const tasks = useMemo(() => {
        const todayItems = allTasks.filter((t: any) => t.createdAt && t.createdAt.startsWith(todayStr));
        const listToDisplay = todayItems.length > 0 ? todayItems : allTasks.slice(0, 10);

        // Deduplicate
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const item of listToDisplay) {
            const key = item._id || item.taskId || JSON.stringify(item);
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        }
        return deduped;
    }, [allTasks, todayStr]);

    const isShowingRecent = allTasks.filter((t: any) => t.createdAt && t.createdAt.startsWith(todayStr)).length === 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Today's Tasks
                            <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500">
                            Tasks created or active today across company departments
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin/tasks"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline px-2 py-1"
                >
                    View All Tasks →
                </Link>
            </div>
                {isShowingRecent && allTasks.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-800">
                        <Sparkles size={16} className="text-amber-600 shrink-0" />
                        <span>No new tasks created today yet. Showing most recent company assignments below.</span>
                    </div>
                )}

                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    {loading ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
                            <p className="font-semibold text-slate-700 text-sm">Loading today's tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                            <Clock size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="font-semibold text-slate-700 text-sm">No tasks found</p>
                            <p className="text-xs text-slate-400 mt-1">There are no tasks assigned yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {tasks.map((task: any) => (
                                <div key={task._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900 text-sm">{task.title}</h3>
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                #{task.taskId || "TASK"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{task.description || "No description provided."}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                                            <span>Assignee: <strong className="text-slate-700">{task.developer?.name || task.assignedTo?.name || "Unassigned"}</strong></span>
                                            <span>•</span>
                                            <span>Role: <strong className="text-slate-700 capitalize">{task.assignedToRole || task.role || "Developer"}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                            task.status === "completed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : task.status === "in-progress"
                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}>
                                            {task.status || "pending"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
        </div>
    );
}

export default function AdminTasksTodayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading today's tasks...
            </div>
        }>
            <AdminTasksTodayContent />
        </Suspense>
    );
}
