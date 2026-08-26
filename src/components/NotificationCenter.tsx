"use client";

import React, { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, MessageSquare, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import { useNotifications } from "@/hooks/useNotifications";

export interface INotif {
    _id?: string;
    recipientId: string;
    senderId?: string;
    senderName?: string;
    type: "task_assigned" | "task_updated" | "new_message" | "system";
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string | Date;
}

interface NotificationCenterProps {
    currentUserId: string;
}

export default function NotificationCenter({ currentUserId }: NotificationCenterProps) {
    const {
        notifications,
        unreadCount,
        refetch,
        markAsRead,
        markAllRead,
        clearAll: clearAllNotifications,
        deleteNotification: removeNotif,
    } = useNotifications(currentUserId);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentUserId) return;

        const socket = getSocket();

        const handleNewNotification = () => {
            refetch();
        };

        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [currentUserId, refetch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = (notifId?: string) => {
        if (notifId) markAsRead(notifId);
    };

    const handleMarkAllRead = () => {
        markAllRead();
    };

    const handleDeleteNotification = (e: React.MouseEvent, notifId?: string) => {
        e.stopPropagation();
        if (notifId) removeNotif(notifId);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "task_assigned":
                return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case "task_updated":
                return <AlertCircle className="h-4 w-4 text-amber-400" />;
            case "new_message":
                return <MessageSquare className="h-4 w-4 text-indigo-400" />;
            default:
                return <Info className="h-4 w-4 text-sky-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                title="Notifications"
            >
                <Bell size={19} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute -right-2 sm:right-0 mt-3 w-[calc(100vw-32px)] max-w-sm sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => handleMarkAllRead()}
                                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition font-medium"
                                >
                                    <CheckCheck size={14} />
                                    Mark all
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => clearAllNotifications()}
                                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition font-medium"
                                    title="Clear All Notifications"
                                >
                                    <Trash2 size={13} />
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notif, index) => (
                                <div
                                    key={notif._id || index}
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    className={`group flex items-start gap-3 p-4 transition cursor-pointer hover:bg-slate-800/50 ${
                                        !notif.isRead ? "bg-indigo-950/20" : ""
                                    }`}
                                >
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-slate-200 truncate">
                                                {notif.title}
                                            </p>
                                            <span className="text-[10px] text-slate-500 shrink-0">
                                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">
                                            {notif.message}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteNotification(e, notif._id)}
                                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                                        title="Delete notification"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
