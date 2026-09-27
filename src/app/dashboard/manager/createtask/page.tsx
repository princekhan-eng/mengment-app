"use client";

import { FormEvent, useEffect, useState, useMemo, Suspense } from "react";
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
    AlertCircle,
} from "lucide-react";
import { useDevelopers, useTesters, useEmployeeById } from "@/hooks/useEmployees";
import { useCreateTask } from "@/hooks/useTasks";

interface Employee {
    _id: string;
    name: string;
    employeeId: string;
    email?: string;
    role?: string;
}

export function CreateTaskContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const paramEmployeeId = searchParams.get("employeeId");

    const { data: specificEmployee, isLoading: loadingSpecific } = useEmployeeById(paramEmployeeId);
    const { data: rawDevelopers = [], isLoading: loadingDevs } = useDevelopers();
    const { data: rawTesters = [], isLoading: loadingTesters } = useTesters();

    const createTaskMutation = useCreateTask();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [assignedTo, setAssignedTo] = useState("");
    const [assignedToRole, setAssignedToRole] = useState<"developer" | "tester">("developer");

    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [dueDate, setDueDate] = useState("");

    // Deduplicate lists
    const developers = useMemo(() => {
        const seen = new Set<string>();
        const res: Employee[] = [];
        for (const d of rawDevelopers) {
            const key = d._id || d.employeeId;
            if (key && !seen.has(key)) {
                seen.add(key);
                res.push(d as Employee);
            }
        }
        return res;
    }, [rawDevelopers]);

    const testers = useMemo(() => {
        const seen = new Set<string>();
        const res: Employee[] = [];
        for (const t of rawTesters) {
            const key = t._id || t.employeeId;
            if (key && !seen.has(key)) {
                seen.add(key);
                res.push(t as Employee);
            }
        }
        return res;
    }, [rawTesters]);

    useEffect(() => {
        if (specificEmployee) {
            setAssignedTo(specificEmployee._id);
            if (specificEmployee.role === "tester") {
                setAssignedToRole("tester");
            } else {
                setAssignedToRole("developer");
            }
        }
    }, [specificEmployee]);

    const employees = assignedToRole === "developer" ? developers : testers;
    const loadingEmployees = loadingSpecific || loadingDevs || loadingTesters;

    const handleRoleChange = (role: "developer" | "tester") => {
        setAssignedToRole(role);
        setAssignedTo("");
    };

    const selectedEmployee = useMemo(() => {
        return employees.find((e) => e._id === assignedTo) || (specificEmployee?._id === assignedTo ? specificEmployee : null);
    }, [employees, assignedTo, specificEmployee]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!title.trim()) {
            setError("Task title is required.");
            return;
        }

        if (!assignedTo) {
            setError(`Please select a ${assignedToRole} to assign this task to.`);
            return;
        }

        try {
            await createTaskMutation.mutateAsync({
                title: title.trim(),
                description: description.trim(),
                assignedToRole,
                assignedTo,
                priority,
                dueDate: dueDate || undefined,
            });

            setSuccess("Task created and assigned successfully!");
            setTimeout(() => {
                router.push("/dashboard/manager/tasks");
            }, 1200);
        } catch (err: any) {
            console.error("Create task error:", err);
            setError(err.response?.data?.message || err.message || "Failed to create task.");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden"
                        >
                            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                        <FileText size={20} className="text-indigo-600" />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900 text-sm">
                                            Task Specifications
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Provide task details, assignee, priority, and deadline.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 space-y-5">
                                {/* Error */}
                                {error && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                {/* Success */}
                                {success && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                                        <CheckCircle2 size={16} />
                                        {success}
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Task Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Implement authentication API endpoints"
                                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-xs"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Task Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe technical scope, required verifications, or documentation links..."
                                        rows={4}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none resize-none text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-xs"
                                    />
                                </div>

                                {/* Assign To */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                                        Assign Target Role <span className="text-rose-500">*</span>
                                    </label>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange("developer")}
                                            className={`p-3.5 rounded-xl border text-left transition shadow-xs ${
                                                assignedToRole === "developer"
                                                    ? "border-blue-300 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20"
                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                                                        assignedToRole === "developer"
                                                            ? "bg-blue-600 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    <Code2 size={18} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-xs">Developer</p>
                                                    <p className="text-[11px] text-slate-500">{developers.length} available</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange("tester")}
                                            className={`p-3.5 rounded-xl border text-left transition shadow-xs ${
                                                assignedToRole === "tester"
                                                    ? "border-amber-300 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20"
                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                                                        assignedToRole === "tester"
                                                            ? "bg-amber-600 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    <ShieldCheck size={18} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-xs">QA Tester</p>
                                                    <p className="text-[11px] text-slate-500">{testers.length} available</p>
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
                                            className="appearance-none w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 outline-none text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition"
                                        >
                                            <option value="" className="text-slate-400">
                                                {loadingEmployees
                                                    ? "Loading team members..."
                                                    : employees.length === 0
                                                    ? `No ${assignedToRole}s available in team`
                                                    : `Select ${assignedToRole} recipient`}
                                            </option>

                                            {employees.map((employee) => (
                                                <option
                                                    key={employee._id}
                                                    value={employee._id}
                                                    className="text-slate-900"
                                                >
                                                    {employee.name} — ({employee.employeeId})
                                                </option>
                                            ))}
                                        </select>

                                        <ChevronDown
                                            size={16}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                        />
                                    </div>
                                </div>

                                {/* Priority + Due Date */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Priority */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                                                className="appearance-none w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 outline-none text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs transition"
                                            >
                                                <option value="low">Low Priority</option>
                                                <option value="medium">Medium Priority</option>
                                                <option value="high">High Priority</option>
                                                <option value="urgent">Urgent Priority</option>
                                            </select>

                                            <ChevronDown
                                                size={16}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Due Deadline Date
                                        </label>

                                        <div className="relative">
                                            <CalendarDays
                                                size={16}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs transition"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        disabled={createTaskMutation.isPending}
                                        className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition disabled:opacity-50 shadow-xs"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={createTaskMutation.isPending || loadingEmployees}
                                        className="h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs transition"
                                    >
                                        {createTaskMutation.isPending ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Creating Task...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Create & Assign Task
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-5">
                        {/* Assignment Preview */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    <Users size={18} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        Assignee Target
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Selected recipient summary
                                    </p>
                                </div>
                            </div>

                            {selectedEmployee ? (
                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shadow-xs">
                                            {selectedEmployee.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs">
                                                {selectedEmployee.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 capitalize">
                                                {selectedEmployee.employeeId} • {assignedToRole}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedEmployee.email && (
                                        <p className="text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                                            {selectedEmployee.email}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                                    No employee selected yet.
                                </div>
                            )}
                        </div>

                        {/* Priority Guide */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Priority Level Guide
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    <span><strong>Low:</strong> Routine improvements or low urgency items</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span><strong>Medium:</strong> Standard sprint commitments</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                                    <span><strong>High:</strong> Priority features or critical client requests</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                    <span><strong>Urgent:</strong> Blocker bugs or immediate releases</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default function CreateTaskPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
                Loading task creator...
            </div>
        }>
            <CreateTaskContent />
        </Suspense>
    );
}