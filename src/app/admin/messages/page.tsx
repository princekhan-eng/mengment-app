"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import TeamChat, { ChatUser } from "@/components/TeamChat";
import { Loader2, Shield } from "lucide-react";

export default function AdminMessagesPage() {
    const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
    const [teamMembers, setTeamMembers] = useState<ChatUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [meRes, teamRes] = await Promise.all([
                    apiClient.get("/API/getme").catch(() => ({ data: null })),
                    apiClient.get("/API/team/members"),
                ]);

                if (meRes?.data?.success && meRes.data.user) {
                    const u = meRes.data.user;
                    setCurrentUser({
                        id: u._id || u.id || "admin_user",
                        name: u.name || "System Admin",
                        role: "admin",
                    });
                } else {
                    setCurrentUser({
                        id: "admin_default",
                        name: "System Admin",
                        role: "admin",
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
                console.error("Failed to load admin messaging data:", err);
                setCurrentUser({
                    id: "admin_default",
                    name: "System Admin",
                    role: "admin",
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
                <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-3" />
                <p className="text-sm font-semibold">Loading System Admin Communication Panel...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-2">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                        <Shield className="text-rose-600" size={22} />
                        Admin Global Team Communication
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Monitor company channels and direct message any manager, developer, or tester.
                    </p>
                </div>
            </div>

            <TeamChat currentUser={currentUser} teamMembers={teamMembers} />
        </div>
    );
}
