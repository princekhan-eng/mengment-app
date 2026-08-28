"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    Send,
    MessageSquare,
    Download,
    Image as ImageIcon,
    FileText,
    Shield,
    Briefcase,
    Code,
    Bug,
    Trash2,
    Menu,
    X,
    Mic,
    Square,
    Volume2,
    Loader2,
} from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import ImageKitUploader, { UploadedFile } from "./ImageKitUploader";
import ConfirmModal from "./ConfirmModal";

export interface ChatUser {
    id: string;
    employeeId?: string;
    name: string;
    role: "admin" | "manager" | "developer" | "tester";
}

interface TeamChatProps {
    currentUser: ChatUser;
    teamMembers?: ChatUser[];
}

interface MessageItem {
    _id?: string;
    senderId: string;
    senderName: string;
    senderRole: "admin" | "manager" | "developer" | "tester";
    receiverId?: string;
    roomId: string;
    content: string;
    attachments?: UploadedFile[];
    createdAt: string | Date;
}

const DEFAULT_CHANNELS = [
    { id: "general", name: "General Announcements", desc: "Company-wide updates & general discussion" },
    { id: "dev-tasks", name: "Dev Team Chat", desc: "Developer tasks & codebase support" },
    { id: "qa-bugs", name: "QA Testing & Bugs", desc: "Bug reports & test verifications" },
];

import { useQueryClient } from "@tanstack/react-query";
import { useTeamMessages } from "@/hooks/useTeamMessages";

export default function TeamChat({ currentUser, teamMembers = [] }: TeamChatProps) {
    const queryClient = useQueryClient();
    const [selectedRoom, setSelectedRoom] = useState<string>("general");
    const [selectedRecipient, setSelectedRecipient] = useState<ChatUser | null>(null);

    const {
        messages,
        refetch,
        sendMessage,
        deleteMessage,
        clearRoom,
    } = useTeamMessages(selectedRoom);

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [inputContent, setInputContent] = useState("");
    const [attachments, setAttachments] = useState<UploadedFile[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; name: string; role: string }>>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    // Modal States
    const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null);
    const [isClearRoomModalOpen, setIsClearRoomModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Voice Message states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!currentUser || !currentUser.id || !selectedRoom) return;

        const socket = getSocket();

        const handleConnect = () => {
            console.log("[TeamChat] Socket connected/reconnected. Joining room:", selectedRoom);
            socket.emit("user_online", {
                userId: currentUser.id,
                name: currentUser.name,
                role: currentUser.role,
            });
            socket.emit("join_room", selectedRoom);
        };

        if (socket.connected) {
            handleConnect();
        }

        const handleOnlineUsers = (users: any[]) => {
            setOnlineUsers(users);
        };

        const handleReceiveMessage = (msg: MessageItem) => {
            console.log("[TeamChat] Socket received message:", msg, "selectedRoom:", selectedRoom);
            if (msg.roomId === selectedRoom) {
                console.log("[TeamChat] Room matched selectedRoom. Appending to query cache...");
                queryClient.setQueryData<MessageItem[]>(["messages", selectedRoom], (old) => {
                    const oldMessages = old || [];
                    const exists = oldMessages.some(
                        (m) =>
                            m._id === msg._id ||
                            (m.createdAt === msg.createdAt &&
                                m.senderId === msg.senderId &&
                                m.content === msg.content)
                    );
                    if (exists) return oldMessages;
                    return [...oldMessages, msg];
                });
            } else {
                console.log("[TeamChat] Room does not match selectedRoom. No action.");
            }
        };

        const handleUserTyping = ({ roomId, senderName }: { roomId: string; senderName: string }) => {
            if (roomId === selectedRoom) {
                setTypingUser(senderName);
            }
        };

        const handleUserStopTyping = ({ roomId }: { roomId: string }) => {
            if (roomId === selectedRoom) {
                setTypingUser(null);
            }
        };

        socket.on("connect", handleConnect);
        socket.on("online_users_list", handleOnlineUsers);
        socket.on("receive_message", handleReceiveMessage);
        socket.on("user_typing", handleUserTyping);
        socket.on("user_stop_typing", handleUserStopTyping);

        // Run once on mount / selectedRoom change
        socket.emit("user_online", {
            userId: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
        });
        socket.emit("join_room", selectedRoom);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("online_users_list", handleOnlineUsers);
            socket.off("receive_message", handleReceiveMessage);
            socket.off("user_typing", handleUserTyping);
            socket.off("user_stop_typing", handleUserStopTyping);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, [currentUser, selectedRoom, queryClient]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUser]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach((track) => track.stop());
                await uploadVoiceMessage(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Failed to access microphone. Please check your browser permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = () => {
                if (mediaRecorderRef.current) {
                    const stream = mediaRecorderRef.current.stream;
                    stream.getTracks().forEach((track) => track.stop());
                }
            };
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
            setRecordingDuration(0);
        }
    };

    const uploadVoiceMessage = async (blob: Blob) => {
        setIsUploadingVoice(true);
        try {
            const file = new File([blob], `voice_message_${Date.now()}.webm`, {
                type: "audio/webm",
            });

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/API/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to upload voice message");
            }

            const uploaded: UploadedFile = {
                url: data.url,
                name: `Voice Message (${formatDuration(recordingDuration)})`,
                fileType: "audio/webm",
                size: data.size || file.size,
                fileId: data.fileId,
            };

            setAttachments((prev) => [...prev, uploaded]);
        } catch (err: any) {
            console.error("Voice message upload failed:", err);
            alert("Failed to upload voice message: " + err.message);
        } finally {
            setIsUploadingVoice(false);
            setRecordingDuration(0);
        }
    };

    const selectChannel = (channelId: string) => {
        setSelectedRoom(channelId);
        setSelectedRecipient(null);
        setIsMobileSidebarOpen(false);
    };

    const selectMember = (member: ChatUser) => {
        setSelectedRecipient(member);
        const ids = [currentUser.id, member.id].sort();
        const dmRoomId = `dm_${ids[0]}_${ids[1]}`;
        setSelectedRoom(dmRoomId);
        setIsMobileSidebarOpen(false);
    };

    const isUserOnline = (userId: string) => {
        return onlineUsers.some((u) => u.userId === userId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputContent(e.target.value);

        const socket = getSocket();
        socket.emit("typing", { roomId: selectedRoom, senderName: currentUser.name });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", { roomId: selectedRoom });
        }, 2000);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputContent.trim() && attachments.length === 0) return;

        const newMsgData: MessageItem = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            receiverId: selectedRecipient ? selectedRecipient.id : undefined,
            roomId: selectedRoom,
            content: inputContent.trim(),
            attachments: [...attachments],
            createdAt: new Date().toISOString(),
        };

        const socket = getSocket();
        console.log("[TeamChat] Emitting send_message via socket:", newMsgData);
        socket.emit("send_message", newMsgData);
        socket.emit("stop_typing", { roomId: selectedRoom });

        try {
            await sendMessage(newMsgData);
        } catch (err) {
            console.error("Failed to persist message:", err);
        }

        setInputContent("");
        setAttachments([]);
    };

    const confirmDeleteMessage = async () => {
        if (!deleteMsgId) return;
        try {
            await deleteMessage(deleteMsgId);
        } catch (err) {
            console.error("Error deleting message:", err);
        } finally {
            setDeleteMsgId(null);
        }
    };

    const confirmClearChatRoom = async () => {
        if (!selectedRoom) return;
        try {
            await clearRoom(selectedRoom);
        } catch (err) {
            console.error("Error clearing chat room:", err);
        } finally {
            setIsClearRoomModalOpen(false);
        }
    };

    const handleUploadSuccess = (uploaded: UploadedFile) => {
        setAttachments((prev) => [...prev, uploaded]);
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20"><Shield size={10} /> Admin</span>;
            case "manager":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20"><Briefcase size={10} /> Manager</span>;
            case "developer":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"><Code size={10} /> Dev</span>;
            case "tester":
                return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"><Bug size={10} /> Tester</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-[750px] w-full rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Delete Single Message Modal */}
            <ConfirmModal
                isOpen={!!deleteMsgId}
                title="Delete Message"
                message="Are you sure you want to permanently delete this message for everyone in the chat?"
                confirmText="Delete Message"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDeleteMessage}
                onCancel={() => setDeleteMsgId(null)}
            />

            {/* Clear Chat Room Modal */}
            <ConfirmModal
                isOpen={isClearRoomModalOpen}
                title="Clear Entire Chat"
                message={`Are you sure you want to delete ALL messages in ${selectedRecipient ? selectedRecipient.name : (DEFAULT_CHANNELS.find((c) => c.id === selectedRoom)?.name || selectedRoom)} permanently? This action cannot be undone.`}
                confirmText="Clear All Messages"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmClearChatRoom}
                onCancel={() => setIsClearRoomModalOpen(false)}
            />

            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* CHAT SIDEBAR */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Team Workspaces</h3>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                {onlineUsers.length} Online Now
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-1 text-slate-400 hover:text-white md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    <div>
                        <p className="px-2 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                            Channels
                        </p>
                        <div className="space-y-1">
                            {DEFAULT_CHANNELS.map((ch) => (
                                <button
                                    key={ch.id}
                                    onClick={() => selectChannel(ch.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                                        selectedRoom === ch.id && !selectedRecipient
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                    }`}
                                >
                                    <MessageSquare size={16} className={selectedRoom === ch.id ? "text-white" : "text-slate-400"} />
                                    <span className="truncate">{ch.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="px-2 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                            Direct Messages
                        </p>
                        <div className="space-y-1">
                            {teamMembers.length === 0 ? (
                                <p className="px-3 text-xs text-slate-500">No other team members found</p>
                            ) : (
                                teamMembers
                                    .filter((m) => m.id !== currentUser.id)
                                    .map((member) => {
                                        const online = isUserOnline(member.id);
                                        const isSelected = selectedRecipient?.id === member.id;
                                        return (
                                            <button
                                                key={member.id}
                                                onClick={() => selectMember(member)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                                                    isSelected
                                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="relative">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span
                                                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${
                                                                online ? "bg-emerald-500" : "bg-slate-600"
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="truncate text-left">
                                                        <p className="truncate leading-none font-semibold">{member.name}</p>
                                                        <span className="text-[10px] text-slate-400 capitalize">{member.role}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CHAT MAIN WINDOW */}
            <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white md:hidden shrink-0"
                            title="Toggle Workspaces"
                        >
                            <Menu size={18} />
                        </button>

                        {selectedRecipient ? (
                            <>
                                <div className="relative">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30">
                                        {selectedRecipient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span
                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${
                                            isUserOnline(selectedRecipient.id) ? "bg-emerald-500" : "bg-slate-600"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                        {selectedRecipient.name}
                                        {getRoleBadge(selectedRecipient.role)}
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                        {isUserOnline(selectedRecipient.id) ? "Active Now (Online)" : "Offline"}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">
                                        {DEFAULT_CHANNELS.find((c) => c.id === selectedRoom)?.name || selectedRoom}
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                        {DEFAULT_CHANNELS.find((c) => c.id === selectedRoom)?.desc || "Team communication channel"}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {messages.length > 0 && (
                        <button
                            onClick={() => setIsClearRoomModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-600 hover:text-white transition"
                            title="Clear all messages in this chat permanently"
                        >
                            <Trash2 size={13} />
                            Clear Chat
                        </button>
                    )}
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                            <MessageSquare className="h-10 w-10 mb-2 opacity-30 text-indigo-400" />
                            <p className="text-sm font-medium">No messages in this chat yet</p>
                            <p className="text-xs text-slate-600">Send a message or upload a file to start real-time conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.senderId === currentUser.id;
                            const canDelete = isMe || currentUser.role === "admin" || currentUser.role === "manager";
                            return (
                                <div
                                    key={msg._id || index}
                                    className={`group flex flex-col ${isMe ? "items-end" : "items-start"} relative`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-slate-300">
                                            {isMe ? "You" : msg.senderName}
                                        </span>
                                        {getRoleBadge(msg.senderRole)}
                                        <span className="text-[10px] text-slate-500">
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }) : ""}
                                        </span>
                                    </div>

                                    <div className="relative flex items-center gap-2 max-w-md">
                                        {canDelete && (
                                            <button
                                                onClick={() => setDeleteMsgId(msg._id || null)}
                                                className={`opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-800 ${
                                                    isMe ? "order-first" : "order-last"
                                                }`}
                                                title="Delete message permanently"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}

                                        <div
                                            className={`rounded-2xl p-3.5 text-sm shadow-md ${
                                                isMe
                                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                                    : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none"
                                            }`}
                                        >
                                            {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {msg.attachments.map((file, i) => {
                                                        const isAudio = file.fileType?.startsWith("audio/") || file.name.endsWith(".webm") || file.name.endsWith(".wav") || file.name.endsWith(".mp3");
                                                        return (
                                                            <div key={i} className="rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950/40 p-2">
                                                                {file.fileType?.startsWith("image/") ? (
                                                                    <div>
                                                                        <img
                                                                            src={file.url}
                                                                            alt={file.name}
                                                                            className="max-h-56 w-full object-cover rounded-md mb-1.5"
                                                                        />
                                                                        <a
                                                                            href={file.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center justify-between text-xs text-indigo-300 hover:underline"
                                                                        >
                                                                            <span className="truncate">{file.name}</span>
                                                                            <Download size={14} />
                                                                        </a>
                                                                    </div>
                                                                ) : isAudio ? (
                                                                    <div className="flex flex-col gap-1.5 p-1">
                                                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                                                            <Volume2 size={14} className="text-rose-400 shrink-0 animate-pulse" />
                                                                            <span className="font-semibold truncate flex-1">{file.name}</span>
                                                                        </div>
                                                                        <audio
                                                                            src={file.url}
                                                                            controls
                                                                            className="w-full h-8 mt-1 rounded bg-slate-900 border border-slate-700/60"
                                                                            preload="metadata"
                                                                        />
                                                                        <a
                                                                            href={file.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex justify-end text-[10px] text-indigo-300 hover:underline px-1"
                                                                        >
                                                                            Download Audio
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <a
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-xs text-indigo-300 hover:underline p-1"
                                                                    >
                                                                        <FileText size={16} className="text-indigo-400 shrink-0" />
                                                                        <span className="truncate flex-1">{file.name}</span>
                                                                        <Download size={14} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {typingUser && (
                        <div className="text-xs text-indigo-400 italic flex items-center gap-1.5 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            {typingUser} is typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/60">
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {attachments.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 text-xs text-indigo-200"
                                >
                                    <ImageIcon size={14} className="text-indigo-400" />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button
                                        onClick={() => removeAttachment(idx)}
                                        className="text-slate-400 hover:text-rose-400 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <ImageKitUploader onUploadSuccess={handleUploadSuccess} compact={true} />

                        {!isRecording && !isUploadingVoice && (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition"
                                title="Record Voice Message"
                            >
                                <Mic size={18} className="text-rose-400" />
                            </button>
                        )}

                        {isRecording ? (
                            <div className="flex-1 flex items-center justify-between bg-rose-950/20 border border-rose-500/30 rounded-xl px-4 py-2.5">
                                <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold animate-pulse">
                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                    Recording: {formatDuration(recordingDuration)}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={cancelRecording}
                                        className="p-1 text-slate-400 hover:text-rose-400 transition"
                                        title="Discard recording"
                                    >
                                        <X size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={stopRecording}
                                        className="flex items-center justify-center h-7 w-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition shadow-md shadow-rose-600/30"
                                        title="Stop and attach"
                                    >
                                        <Square size={12} fill="white" />
                                    </button>
                                </div>
                            </div>
                        ) : isUploadingVoice ? (
                            <div className="flex-1 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-indigo-400 font-semibold gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading voice message...
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={inputContent}
                                onChange={handleInputChange}
                                placeholder={`Message ${selectedRecipient ? selectedRecipient.name : "#" + selectedRoom}...`}
                                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                            />
                        )}

                        <button
                            type="submit"
                            disabled={(!inputContent.trim() && attachments.length === 0) || isRecording || isUploadingVoice}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
