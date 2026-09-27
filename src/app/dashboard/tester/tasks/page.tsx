"use client";

import React, { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    TestTube2,
    Search,
    CalendarDays,
    Bug,
    ChevronRight,
    Loader2,
    X,
    AlertCircle,
    FileText,
} from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import ImageKitUploader, { UploadedFile } from "@/components/ImageKitUploader";
import { useTesterTasks, useUpdateTesterTaskStatus } from "@/hooks/useTasks";

function TesterTasksContent() {
    const { data: rawTasks = [], isLoading: loading } = useTesterTasks();
    const updateTesterTaskMutation = useUpdateTesterTaskStatus();

    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [testingNotes, setTestingNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

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

    const submitResult = async (status: "completed" | "in-progress") => {
        if (!selectedTask) return;
        try {
            setSubmitting(true);
            await updateTesterTaskMutation.mutateAsync({
                taskId: selectedTask._id,
                status,
            });
            getSocket().emit("task_updated", {
                title: selectedTask.title,
                status,
            });
            setSelectedTask(null);
            setTestingNotes("");
        } catch (err) {
            console.error("Submit test result error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesStatus = filterStatus === "all" || task.status === filterStatus;
        const matchesSearch =
            task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/tester"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-amber-600 shadow-xs"
                        title="Back to Tester Portal"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TestTube2 className="text-amber-600" size={22} />
                            QA Testing Tasks & Verification
                        </h1>
                        <p className="text-xs text-slate-500">
                            Review development builds, record test results, and attach bug screenshots.
                        </p>
                    </div>
                </div>
            </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {[
                            { id: "all", label: "All Tasks" },
                            { id: "pending", label: "Pending" },
                            { id: "in-progress", label: "In Progress" },
                            { id: "completed", label: "Completed" },
                        ].map((st) => (
                            <button
                                key={st.id}
                                onClick={() => setFilterStatus(st.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs ${
                                    filterStatus === st.id
                                        ? "bg-amber-600 text-white shadow-amber-600/20"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none shadow-xs"
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    {loading ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-2" />
                            <p className="text-xs font-semibold">Loading QA tasks...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 text-xs">
                            No tasks found matching your filter.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                                >
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                #{task.taskId || "TASK"}
                                            </span>
                                            <h3 className="font-semibold text-slate-900 text-sm">{task.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                task.status === "completed"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : task.status === "in-progress"
                                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                            }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{task.description || "No description provided."}</p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => setSelectedTask(task)}
                                            className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shadow-xs flex items-center gap-1"
                                        >
                                            <Bug size={14} />
                                            Record QA Result
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Record QA Result Modal */}
                {selectedTask && (
                    <div
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
                        onClick={() => setSelectedTask(null)}
                    >
                        <div
                            className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-mono text-slate-400">
                                        #{selectedTask.taskId}
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                                        {selectedTask.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Task Scope
                                </p>
                                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                                    {selectedTask.description || "No description provided."}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    QA Verification Notes / Bug Summary
                                </label>
                                <textarea
                                    value={testingNotes}
                                    onChange={(e) => setTestingNotes(e.target.value)}
                                    placeholder="Enter test steps executed, pass/fail criteria, bug reproduction..."
                                    rows={4}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none resize-none text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition shadow-xs"
                                />
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => submitResult("completed")}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    <CheckCircle2 size={16} />
                                    Mark Passed & Completed
                                </button>
                                <button
                                    onClick={() => submitResult("in-progress")}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    <Clock3 size={16} />
                                    Keep In-Progress / Issues Found
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

export default function TesterTasksPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading QA tasks...
            </div>
        }>
            <TesterTasksContent />
        </Suspense>
    );
}
