"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Code2,
    FileText,
    Loader2,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";
import { useEmployeeById } from "@/hooks/useEmployees";
import { useCreateTask } from "@/hooks/useTasks";

interface Employee {
    _id: string;
    name: string;
    employeeId: string;
    email?: string;
    role?: string;
}

interface EmployeesResponse {
    success: boolean;
    developers?: Employee[];
    testers?: Employee[];
}

interface CreateTaskResponse {
    success: boolean;
    message: string;
    task?: any;
}

export function CreateTaskContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const employeeId = searchParams.get("employeeId");

    const { data: developer, isLoading: loadingEmployees, error: fetchError } = useEmployeeById(employeeId);
    const createTaskMutation = useCreateTask();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [assignedTo, setAssignedTo] = useState("");
    const [assignedToRole, setAssignedToRole] =
        useState<"developer" | "tester">("developer");

    const [priority, setPriority] = useState<
        "low" | "medium" | "high" | "urgent"
    >("medium");

    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        if (developer) {
            setAssignedTo(developer._id);
            setAssignedToRole("developer");
        }
    }, [developer]);

    const developers = developer ? [developer] : [];
    const testers: Employee[] = [];

    const employees =
        assignedToRole === "developer"
            ? developers
            : testers;

    const handleRoleChange = (
        role: "developer" | "tester"
    ) => {
        setAssignedToRole(role);
        setAssignedTo("");
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        if (!description.trim()) {
            setError("Task description is required.");
            return;
        }

        if (!assignedTo) {
            setError(
                `Please select a ${assignedToRole}.`
            );
            return;
        }

        try {
            const response = await createTaskMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                assignedTo,
                assignedToRole,
                priority,
                dueDate: dueDate || undefined,
            });

            setSuccess(
                response.message ||
                "Task created successfully."
            );

            setTitle("");
            setDescription("");
            setAssignedTo("");
            setPriority("medium");
            setDueDate("");

            setTimeout(() => {
                router.push(
                    "/dashboard/manager/tasks"
                );
            }, 1000);
        } catch (err: any) {
            console.error(
                "Create task error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create task"
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Header */}
            <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-20 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white transition"
                                title="Go Back"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-white">
                                    Create New Task
                                </h1>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Assign sprint task to developer or QA tester
                                </p>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
                            <ShieldCheck size={16} className="text-indigo-400" />
                            Manager Operations
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <FileText size={20} className="text-blue-400" />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-white text-base">
                                            Task Specifications
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            Provide task details, assignee, priority, and deadline.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 space-y-6">
                                {/* Error */}
                                {error && (
                                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400">
                                        {error}
                                    </div>
                                )}

                                {/* Success */}
                                {success && (
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                                        <CheckCircle2 size={18} />
                                        {success}
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                                        Task Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Implement authentication API endpoints"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-800 bg-slate-950 outline-none text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                                        Task Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe technical scope, required verifications, or documentation link..."
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 outline-none resize-none text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>

                                {/* Assign To */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-3">
                                        Assign Target Role <span className="text-rose-500">*</span>
                                    </label>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange("developer")}
                                            className={`p-4 rounded-xl border text-left transition ${
                                                assignedToRole === "developer"
                                                    ? "border-blue-500/50 bg-blue-950/40 text-white ring-1 ring-blue-500/30"
                                                    : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                                        assignedToRole === "developer"
                                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                                            : "bg-slate-800 text-slate-400"
                                                    }`}
                                                >
                                                    <Code2 size={20} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-white text-xs">Developer</p>
                                                    <p className="text-[11px] text-slate-400">{developers.length} available</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange("tester")}
                                            className={`p-4 rounded-xl border text-left transition ${
                                                assignedToRole === "tester"
                                                    ? "border-purple-500/50 bg-purple-950/40 text-white ring-1 ring-purple-500/30"
                                                    : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                                        assignedToRole === "tester"
                                                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                                                            : "bg-slate-800 text-slate-400"
                                                    }`}
                                                >
                                                    <ShieldCheck size={20} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-white text-xs">QA Tester</p>
                                                    <p className="text-[11px] text-slate-400">{testers.length} available</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Employee Select */}
                                    <div className="relative">
                                        <select
                                            value={assignedTo}
                                            onChange={(e) => setAssignedTo(e.target.value)}
                                            disabled={loadingEmployees || employees.length === 0}
                                            className="appearance-none w-full h-12 pl-4 pr-10 rounded-xl border border-slate-800 bg-slate-950 outline-none text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="" className="bg-slate-900 text-slate-400">
                                                {loadingEmployees
                                                    ? "Loading employees..."
                                                    : employees.length === 0
                                                    ? `No ${assignedToRole}s assigned to your team`
                                                    : `Select ${assignedToRole} recipient`}
                                            </option>

                                            {employees.map((employee) => (
                                                <option
                                                    key={employee._id}
                                                    value={employee._id}
                                                    className="bg-slate-900 text-white"
                                                >
                                                    {employee.name} — {employee.employeeId}
                                                </option>
                                            ))}
                                        </select>

                                        <ChevronDown
                                            size={18}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                        />
                                    </div>
                                </div>

                                {/* Priority + Due Date */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Priority */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                                            Task Priority
                                        </label>

                                        <div className="relative">
                                            <select
                                                value={priority}
                                                onChange={(e) =>
                                                    setPriority(
                                                        e.target.value as "low" | "medium" | "high" | "urgent"
                                                    )
                                                }
                                                className="appearance-none w-full h-12 px-4 pr-10 rounded-xl border border-slate-800 bg-slate-950 outline-none text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="low" className="bg-slate-900 text-white">Low</option>
                                                <option value="medium" className="bg-slate-900 text-white">Medium</option>
                                                <option value="high" className="bg-slate-900 text-white">High</option>
                                                <option value="urgent" className="bg-slate-900 text-white">Urgent</option>
                                            </select>

                                            <ChevronDown
                                                size={18}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                                            Due Deadline Date
                                        </label>

                                        <div className="relative">
                                            <CalendarDays
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                            />

                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-950 outline-none text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="pt-4 border-t border-slate-800/80 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        disabled={createTaskMutation.isPending}
                                        className="h-11 px-6 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-semibold text-xs hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={createTaskMutation.isPending || loadingEmployees}
                                        className="h-11 px-7 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                                    >
                                        {createTaskMutation.isPending ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Creating Task...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Create & Assign Task
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-6">
                        {/* Assignment Preview */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                    <Users size={18} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-white text-sm">
                                        Assignee Target
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Selected team recipient
                                    </p>
                                </div>
                            </div>

                            {assignedTo ? (
                                (() => {
                                    const employee = employees.find((item) => item._id === assignedTo);

                                    return employee ? (
                                        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                                                    {employee.name.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-white text-xs truncate">
                                                        {employee.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono">
                                                        ID: {employee.employeeId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                                                <span className="text-slate-400">Assigned Role:</span>
                                                <span className="font-semibold text-indigo-400 capitalize">
                                                    {assignedToRole}
                                                </span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()
                            ) : (
                                <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 text-center">
                                    <UserRound size={28} className="mx-auto text-slate-600" />
                                    <p className="text-xs text-slate-400 mt-2">
                                        No employee selected yet
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Task Preview Card */}
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                                    <FileText size={18} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm">
                                        Live Task Preview
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Card appearance on member dashboard
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Title</p>
                                    <p className="font-semibold text-white mt-0.5">
                                        {title || "Untitled Sprint Task"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase">Priority</p>
                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase text-slate-300">
                                            {priority}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase">Status</p>
                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase">
                                            Pending
                                        </span>
                                    </div>
                                </div>

                                {dueDate && (
                                    <div className="border-t border-slate-800/80 pt-2.5">
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase">Due Deadline</p>
                                        <p className="mt-0.5 text-slate-300 font-medium">
                                            {new Date(dueDate).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CreateTaskPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <CreateTaskContent />
        </Suspense>
    );
}