"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import {
    ArrowLeft,
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
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { getSocket } from "@/lib/socketClient";
import ImageKitUploader, { UploadedFile } from "@/components/ImageKitUploader";
import { useDeveloperTasks, useUpdateDeveloperTaskStatus, Task as QueryTask } from "@/hooks/useTasks";

function DeveloperTasksContent() {
    const { data: tasks = [], isLoading: loading } = useDeveloperTasks();
    const updateStatusMutation = useUpdateDeveloperTaskStatus();

    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingTask, setUpdatingTask] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    const updateStatus = async (taskId: string, status: any) => {
        try {
            setUpdatingTask(taskId);
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
            setUpdatingTask(null);
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
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/developer"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Code2 className="text-blue-500" size={22} />
                                My Assigned Development Tasks
                            </h1>
                            <p className="text-xs text-slate-400">
                                View, filter, update status, and attach completion proof files via ImageKit.
                            </p>
                        </div>
                    </div>

                    <NotificationCenter currentUserId="developer_id" />
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {["all", "pending", "in-progress", "completed"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                                    filterStatus === st
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
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
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Tasks List */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                            Loading tasks...
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No tasks found matching criteria.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-800/40"
                                >
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-1">
                                            <Code2 size={20} />
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
                                                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                    }`}
                                                >
                                                    {task.status}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    Priority: <strong className="text-slate-300 uppercase">{task.priority}</strong>
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                        <CalendarDays size={12} />
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {task.status === "pending" && (
                                            <button
                                                disabled={updatingTask === task._id}
                                                onClick={() => updateStatus(task._id, "in-progress")}
                                                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50"
                                            >
                                                Start Task
                                            </button>
                                        )}
                                        {task.status === "in-progress" && (
                                            <button
                                                disabled={updatingTask === task._id}
                                                onClick={() => updateStatus(task._id, "completed")}
                                                className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50"
                                            >
                                                Mark Completed
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedTask(task)}
                                            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                        <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h3 className="font-bold text-white text-base">{selectedTask.title}</h3>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                {selectedTask.description || "No detailed description provided."}
                            </p>

                            {/* ImageKit Proof Upload */}
                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <label className="block text-xs font-semibold text-slate-400">
                                    Attach Completion File / Screenshot (ImageKit)
                                </label>
                                <ImageKitUploader onUploadSuccess={handleUploadSuccess} compact={false} />
                            </div>

                            {selectedTask.files && selectedTask.files.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-400">Attached Files:</p>
                                    {selectedTask.files.map((f: any, i: number) => (
                                        <a
                                            key={i}
                                            href={f.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-xs text-indigo-400 hover:underline"
                                        >
                                            📁 {f.name}
                                        </a>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DeveloperTasksPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <DeveloperTasksContent />
        </Suspense>
    );
}
