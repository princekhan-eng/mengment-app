"use client";

import React, { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    Clock3,
    Code2,
    FileText,
    PlayCircle,
    Search,
    CalendarDays,
    AlertCircle,
    ChevronRight,
    Loader2,
    UploadCloud,
    X,
} from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import ImageKitUploader, { UploadedFile } from "@/components/ImageKitUploader";
import { useDeveloperTasks, useUpdateDeveloperTaskStatus } from "@/hooks/useTasks";

function DeveloperTasksContent() {
    const { data: rawTasks = [], isLoading: loading } = useDeveloperTasks();
    const updateStatusMutation = useUpdateDeveloperTaskStatus();

    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

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

    const updateStatus = async (taskId: string, status: any) => {
        try {
            setUpdatingTaskId(taskId);
            await updateStatusMutation.mutateAsync({ taskId, status });
            const targetTask = tasks.find((t) => t._id === taskId);
            if (targetTask) {
                getSocket().emit("task_updated", {
                    title: targetTask.title,
                    status: status,
                    assignedBy: targetTask.manager?._id,
                });
            }
            if (selectedTask?._id === taskId) {
                setSelectedTask((prev: any) => (prev ? { ...prev, status } : null));
            }
        } catch (err) {
            console.error("Update task status error:", err);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const handleUploadSuccess = async (uploaded: UploadedFile) => {
        if (!selectedTask) return;
        const newFiles = [...(selectedTask.files || []), uploaded];
        setSelectedTask((prev: any) => (prev ? { ...prev, files: newFiles } : null));
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
            {/* Page Title Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                        <Code2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            My Assigned Development Tasks
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            View, filter, update status, and attach completion proof files via ImageKit.
                        </p>
                    </div>
                </div>
            </div>

                {/* Filters & Search */}
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
                                        ? "bg-blue-600 text-white shadow-blue-600/20"
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
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
                        />
                    </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    {loading ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <p className="text-xs font-semibold">Loading tasks...</p>
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
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                                            {task.manager && (
                                                <span>Manager: <strong className="text-slate-700">{task.manager.name}</strong></span>
                                            )}
                                            {task.dueDate && (
                                                <>
                                                    <span>•</span>
                                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <select
                                            value={task.status}
                                            onChange={(e) => updateStatus(task._id, e.target.value)}
                                            disabled={updatingTaskId === task._id}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>

                                        <button
                                            onClick={() => setSelectedTask(task)}
                                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
                                        >
                                            Details & Upload
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details & Proof Upload Modal */}
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
                                    Description
                                </p>
                                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                                    {selectedTask.description || "No description provided."}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-700">Attach Implementation Artifacts / Proofs</p>
                                <ImageKitUploader onUploadSuccess={handleUploadSuccess} compact={false} />
                            </div>

                            {selectedTask.files && selectedTask.files.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <p className="text-xs font-semibold text-slate-700">Uploaded Files</p>
                                    <div className="space-y-1">
                                        {selectedTask.files.map((file: any, i: number) => (
                                            <a
                                                key={i}
                                                href={file.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-blue-600 hover:underline"
                                            >
                                                <FileText size={14} />
                                                <span className="truncate">{file.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default function DeveloperTasksPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading tasks...
            </div>
        }>
            <DeveloperTasksContent />
        </Suspense>
    );
}
