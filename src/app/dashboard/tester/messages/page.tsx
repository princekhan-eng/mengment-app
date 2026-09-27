"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import Link from "next/link";
import TeamChat, { ChatUser } from "@/components/TeamChat";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";

export default function TesterMessagesPage() {
    const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
    const [teamMembers, setTeamMembers] = useState<ChatUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [meRes, teamRes] = await Promise.all([
                    apiClient.get("/API/getme").catch(() => ({ data: null })),
                    apiClient.get("/API/team/members").catch(() => ({ data: null })),
                ]);

                if (meRes?.data?.success && meRes.data.user) {
                    const u = meRes.data.user;
                    setCurrentUser({
                        id: u._id || u.id || "tester_user",
                        employeeId: u.employeeId,
                        name: u.name || "QA Tester",
                        role: (u.role as any) || "tester",
                    });
                } else {
                    setCurrentUser({
                        id: "tester_default",
                        name: "QA Tester",
                        role: "tester",
                    });
                }

                if (teamRes?.data?.success && Array.isArray(teamRes.data.members)) {
                    // Deduplicate
                    const seen = new Set<string>();
                    const deduped: ChatUser[] = [];
                    for (const m of teamRes.data.members) {
                        const key = m.id || m._id || m.employeeId;
                        if (key && !seen.has(key)) {
                            seen.add(key);
                            deduped.push(m);
                        }
                    }
                    setTeamMembers(deduped);
                }
            } catch (err) {
                console.error("Failed to load tester messaging data:", err);
                setCurrentUser({
                    id: "tester_default",
                    name: "QA Tester",
                    role: "tester",
                });
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    if (loading || !currentUser) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-slate-700">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-3" />
                <p className="text-sm font-semibold">Loading QA Tester Workspace...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/tester"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-amber-600 shadow-xs"
                        title="Back to Tester Portal"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare className="text-amber-600" size={22} />
                            QA Testing Communication
                        </h1>
                        <p className="text-xs text-slate-500">
                            Share bug logs, screenshots, and test results with managers and developers.
                        </p>
                    </div>
                </div>
            </div>

            <TeamChat currentUser={currentUser} teamMembers={teamMembers} />
        </div>
    );
}
