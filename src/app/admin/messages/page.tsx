"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import Link from "next/link";
import TeamChat, { ChatUser } from "@/components/TeamChat";
import NotificationCenter from "@/components/NotificationCenter";
import { ArrowLeft, Loader2, Shield } from "lucide-react";

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

                if (teamRes?.data?.success) {
                    setTeamMembers(teamRes.data.members || []);
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
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500 mb-3" />
                <p className="text-sm text-slate-400">Loading System Admin Communication Panel...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="text-rose-500" size={22} />
                                Admin Global Team Communication
                            </h1>
                            <p className="text-xs text-slate-400">
                                Monitor company channels and direct message any manager, developer, or tester.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationCenter currentUserId={currentUser.id} />
                    </div>
                </div>

                <TeamChat currentUser={currentUser} teamMembers={teamMembers} />
            </div>
        </div>
    );
}
