"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import TeamChat, { ChatUser } from "@/components/TeamChat";
import { Loader2, MessageSquare } from "lucide-react";

export default function DeveloperMessagesPage() {
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
                        id: u._id || u.id || "dev_user",
                        employeeId: u.employeeId,
                        name: u.name || "Developer",
                        role: (u.role as any) || "developer",
                    });
                } else {
                    setCurrentUser({
                        id: "dev_default",
                        name: "Developer",
                        role: "developer",
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
                console.error("Failed to load developer messaging data:", err);
                setCurrentUser({
                    id: "dev_default",
                    name: "Developer",
                    role: "developer",
                });
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    if (loading || !currentUser) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                <p className="text-sm font-semibold">Loading Developer Workspace...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-2">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={22} />
                        Developer Team Workspace
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Connect with your manager and QA testers in real-time with file sharing.
                    </p>
                </div>
            </div>

            <TeamChat currentUser={currentUser} teamMembers={teamMembers} />
        </div>
    );
}
