"use client";

import React, { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Mail, UserRound, Loader2, Search, Plus } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useDevelopers } from "@/hooks/useEmployees";

function ManagerDevelopersContent() {
    const { data: rawDevelopers = [], isLoading: loading } = useDevelopers();
    const [search, setSearch] = useState("");

    const developers = useMemo(() => {
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const dev of rawDevelopers) {
            const key = dev._id || dev.employeeId || dev.email;
            if (key && !seen.has(key)) {
                seen.add(key);
                deduped.push(dev);
            }
        }
        return deduped;
    }, [rawDevelopers]);

    const filtered = developers.filter((dev) =>
        dev.name?.toLowerCase().includes(search.toLowerCase()) ||
        dev.email?.toLowerCase().includes(search.toLowerCase()) ||
        dev.employeeId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                        <Code2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Assigned Developers
                            <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full">
                                {developers.length} Developers
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500">
                            Software engineers assigned to your sprints and projects
                        </p>
                    </div>
                </div>
            </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by name, ID, or email..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    {loading ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <p className="text-xs font-semibold">Loading developers...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 text-xs">No developers found.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filtered.map((dev) => (
                                <div key={dev._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                                    <div className="flex items-center gap-3.5">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100 shadow-xs shrink-0">
                                            {dev.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-900 text-sm">{dev.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    dev.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                                }`}>
                                                    {dev.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                <strong className="text-slate-700">{dev.employeeId}</strong> • {dev.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            href={`/dashboard/manager/messages?employeeId=${dev._id}`}
                                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 shadow-xs transition"
                                        >
                                            Message
                                        </Link>
                                        <Link
                                            href={`/dashboard/manager/createtask?employeeId=${dev._id}`}
                                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
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
    );
}

export default function ManagerDevelopersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading developers...
            </div>
        }>
            <ManagerDevelopersContent />
        </Suspense>
    );
}
