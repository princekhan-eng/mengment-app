"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, History, Shield, Loader2 } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useAllTasks } from "@/hooks/useTasks";

function AdminTasksHistoryContent() {
    const { data: tasks = [], isLoading: loading } = useAllTasks();

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <History className="text-purple-400" size={22} />
                                Company Task History & Logs
                            </h1>
                            <p className="text-xs text-slate-400">
                                Historical log of all created, completed, and closed tasks.
                            </p>
                        </div>
                    </div>

                    <NotificationCenter currentUserId="admin_id" />
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-2" />
                            Loading task history...
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No task history found.</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {tasks.map((task) => (
                                <div key={task._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-100 text-sm">{task.title}</h3>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description || "No description"}</p>
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

export default function AdminTasksHistoryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <AdminTasksHistoryContent />
        </Suspense>
    );
}
