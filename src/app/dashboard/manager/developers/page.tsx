"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Mail, UserRound, Loader2 } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useDevelopers } from "@/hooks/useEmployees";

function ManagerDevelopersContent() {
    const { data: developers = [], isLoading: loading } = useDevelopers();

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
                                <Code2 className="text-blue-500" size={22} />
                                My Assigned Developers
                            </h1>
                            <p className="text-xs text-slate-400">
                                View developers on your team, check status, assign tasks, and send direct messages.
                            </p>
                        </div>
                    </div>

                    <NotificationCenter currentUserId="manager_id" />
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                            Loading developers...
                        </div>
                    ) : developers.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No developers assigned to your team yet.</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {developers.map((dev) => (
                                <div key={dev._id} className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                                            {dev.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-100 text-sm">{dev.name}</h3>
                                            <p className="text-xs text-slate-400">{dev.employeeId} • {dev.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/manager/messages?employeeId=${dev._id}`}
                                            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                                        >
                                            Message
                                        </Link>
                                        <Link
                                            href={`/dashboard/manager/createtask?employeeId=${dev._id}`}
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs text-white hover:bg-blue-500"
                                        >
                                            Assign Task
                                        </Link>
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

export default function ManagerDevelopersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <ManagerDevelopersContent />
        </Suspense>
    );
}
