"use client";

import React, { useState, Suspense } from "react";
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
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { getSocket } from "@/lib/socketClient";
import ImageKitUploader, { UploadedFile } from "@/components/ImageKitUploader";
import { useTesterTasks, useUpdateTesterTaskStatus } from "@/hooks/useTasks";

function TesterTasksContent() {
    const { data: tasks = [], isLoading: loading } = useTesterTasks();
    const updateTesterTaskMutation = useUpdateTesterTaskStatus();

    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [testingNotes, setTestingNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

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
                            href="/dashboard/tester"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <TestTube2 className="text-amber-400" size={22} />
                                QA Testing Tasks & Verification
                            </h1>
                            <p className="text-xs text-slate-400">
                                Review development builds, record test results, and attach bug screenshots.
                            </p>
                        </div>
                    </div>

                    <NotificationCenter currentUserId="tester_id" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {["all", "pending", "in-progress", "completed"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                                    filterStatus === st
                                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
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
                            placeholder="Search test tasks..."
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                            Loading test tasks...
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No test tasks found.</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-800/40"
                                >
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-1">
                                            <Bug size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-100 text-sm">{task.title}</h3>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                {task.description || "No description provided"}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                        task.status === "completed"
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                            : task.status === "in-progress"
                                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                            : "bg-slate-800 text-slate-400 border border-slate-700"
                                                    }`}
                                                >
                                                    {task.status}
                                                </span>
                                                {task.testingResult && (
                                                    <span className="text-[10px] text-emerald-400 font-medium truncate max-w-xs">
                                                        Result: {task.testingResult}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setTestingNotes(task.testingResult || "");
                                        }}
                                        className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500 shrink-0"
                                    >
                                        Inspect & Record Result
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inspect Modal */}
                {selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                        <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h3 className="font-bold text-white text-base">{selectedTask.title}</h3>
                                <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
                                    ✕
                                </button>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                {selectedTask.description || "No description provided."}
                            </p>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-300">
                                    Test Verification Result & Bug Findings:
                                </label>
                                <textarea
                                    value={testingNotes}
                                    onChange={(e) => setTestingNotes(e.target.value)}
                                    placeholder="Enter testing notes, steps to reproduce, or verification status..."
                                    rows={4}
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <button
                                    disabled={submitting}
                                    onClick={() => submitResult("in-progress")}
                                    className="px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 text-xs font-semibold hover:bg-amber-600/30"
                                >
                                    Save Draft (In Progress)
                                </button>
                                <button
                                    disabled={submitting}
                                    onClick={() => submitResult("completed")}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                                >
                                    Pass & Complete Test
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TesterTasksPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <TesterTasksContent />
        </Suspense>
    );
}
