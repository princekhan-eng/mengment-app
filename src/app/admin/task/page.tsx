"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    Search,
    RefreshCw,
    UserRound,
    XCircle,
    CalendarDays,
} from "lucide-react";

interface TaskEmployee {
    _id?: string;
    name?: string;
    employeeId?: string;
    role?: "developer" | "tester" | string;
}

interface TaskManager {
    _id?: string;
    name?: string;
    employeeId?: string;
}

interface Task {
    _id: string;
    taskId: string;
    title: string;
    description?: string;

    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in-progress" | "completed";

    dueDate?: string;
    createdAt: string;

    developer?: TaskEmployee;
    tester?: TaskEmployee;
    assignedTo?: TaskEmployee;

    manager?: TaskManager;
}

interface TasksResponse {
    success: boolean;
    message?: string;
    tasks: Task[];
}

type StatusFilter = "all" | Task["status"];
type PriorityFilter = "all" | Task["priority"];

const statusConfig = {
    pending: {
        label: "Pending",
        icon: Clock3,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
        dot: "bg-yellow-500",
    },

    "in-progress": {
        label: "In Progress",
        icon: RefreshCw,
        className: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },

    completed: {
        label: "Completed",
        icon: CheckCircle2,
        className: "bg-green-50 text-green-700 border-green-200",
        dot: "bg-green-500",
    },
};

const priorityConfig = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
};

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");

    const [priorityFilter, setPriorityFilter] =
        useState<PriorityFilter>("all");

    const [selectedTask, setSelectedTask] =
        useState<Task | null>(null);

    const fetchTasks = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await axios.get<TasksResponse>(
                "/API/admin/getalltask"
            );

            if (response.data.success) {
                setTasks(response.data.tasks || []);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error("Admin tasks error:", error);
            setTasks([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const statistics = useMemo(() => {
        return {
            total: tasks.length,

            pending: tasks.filter(
                (task) => task.status === "pending"
            ).length,

            inProgress: tasks.filter(
                (task) => task.status === "in-progress"
            ).length,

            completed: tasks.filter(
                (task) => task.status === "completed"
            ).length,

            urgent: tasks.filter(
                (task) =>
                    task.priority === "urgent" &&
                    task.status !== "completed"
            ).length,
        };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const employee =
                task.assignedTo ||
                task.developer ||
                task.tester;

            const matchesSearch =
                !query ||
                task.taskId?.toLowerCase().includes(query) ||
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                employee?.name?.toLowerCase().includes(query) ||
                employee?.employeeId?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "all" ||
                task.priority === priorityFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });
    }, [tasks, search, statusFilter, priorityFilter]);

    const getEmployee = (task: Task) => {
        return (
            task.assignedTo ||
            task.developer ||
            task.tester ||
            null
        );
    };

    const getEmployeeRole = (task: Task) => {
        const employee = getEmployee(task);

        if (employee?.role) {
            return employee.role;
        }

        if (task.developer) {
            return "developer";
        }

        if (task.tester) {
            return "tester";
        }

        return "employee";
    };

    const formatDate = (date?: string) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-PK", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2
                        size={40}
                        className="animate-spin text-blue-600 mx-auto"
                    />

                    <p className="mt-4 text-slate-600 font-medium">
                        Loading all tasks...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                                    <FileText
                                        size={22}
                                        className="text-white"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        All Tasks
                                    </h1>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Monitor task status across the company
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => fetchTasks(true)}
                            disabled={refreshing}
                            className="
                                inline-flex items-center justify-center
                                gap-2 px-4 py-2.5 rounded-lg
                                bg-slate-900 text-white
                                text-sm font-medium
                                hover:bg-slate-800
                                disabled:opacity-60
                            "
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8">
                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        title="Total Tasks"
                        value={statistics.total}
                        icon={<FileText size={21} />}
                        className="bg-slate-100 text-slate-700"
                    />

                    <StatCard
                        title="Pending"
                        value={statistics.pending}
                        icon={<Clock3 size={21} />}
                        className="bg-yellow-100 text-yellow-700"
                    />

                    <StatCard
                        title="In Progress"
                        value={statistics.inProgress}
                        icon={<RefreshCw size={21} />}
                        className="bg-blue-100 text-blue-700"
                    />

                    <StatCard
                        title="Completed"
                        value={statistics.completed}
                        icon={<CheckCircle2 size={21} />}
                        className="bg-green-100 text-green-700"
                    />

                    <StatCard
                        title="Urgent"
                        value={statistics.urgent}
                        icon={<AlertCircle size={21} />}
                        className="bg-red-100 text-red-700"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search
                                size={18}
                                className="
                                    absolute left-3 top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search task or employee..."
                                className="
                                    w-full pl-10 pr-4 py-2.5
                                    border border-slate-200
                                    rounded-lg outline-none
                                    text-sm
                                    focus:ring-2
                                    focus:ring-blue-500/20
                                    focus:border-blue-500
                                "
                            />
                        </div>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as StatusFilter
                                )
                            }
                            className="
                                px-4 py-2.5
                                border border-slate-200
                                rounded-lg bg-white
                                text-sm text-slate-700
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500/20
                            "
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="in-progress">
                                In Progress
                            </option>

                            <option value="completed">
                                Completed
                            </option>
                        </select>

                        {/* Priority */}
                        <select
                            value={priorityFilter}
                            onChange={(e) =>
                                setPriorityFilter(
                                    e.target.value as PriorityFilter
                                )
                            }
                            className="
                                px-4 py-2.5
                                border border-slate-200
                                rounded-lg bg-white
                                text-sm text-slate-700
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500/20
                            "
                        >
                            <option value="all">
                                All Priority
                            </option>

                            <option value="low">
                                Low
                            </option>

                            <option value="medium">
                                Medium
                            </option>

                            <option value="high">
                                High
                            </option>

                            <option value="urgent">
                                Urgent
                            </option>
                        </select>
                    </div>
                </div>

                {/* Tasks */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-5 sm:px-6 py-5 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Task Status
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    {filteredTasks.length} task
                                    {filteredTasks.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </p>
                            </div>
                        </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                                <XCircle
                                    size={26}
                                    className="text-slate-400"
                                />
                            </div>

                            <h3 className="font-semibold text-slate-900 mt-4">
                                No tasks found
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Task
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Assigned To
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Priority
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Status
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Due Date
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                                Created
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTasks.map((task) => {
                                            const employee =
                                                getEmployee(task);

                                            const role =
                                                getEmployeeRole(task);

                                            const status =
                                                statusConfig[
                                                task.status
                                                ];

                                            const StatusIcon =
                                                status.icon;

                                            return (
                                                <tr
                                                    key={task._id}
                                                    onClick={() =>
                                                        setSelectedTask(
                                                            task
                                                        )
                                                    }
                                                    className="
                                                        hover:bg-slate-50
                                                        cursor-pointer
                                                        transition
                                                    "
                                                >
                                                    <td className="px-6 py-5">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-slate-900">
                                                                    {
                                                                        task.title
                                                                    }
                                                                </span>

                                                                <span className="text-xs text-slate-400">
                                                                    #
                                                                    {
                                                                        task.taskId
                                                                    }
                                                                </span>
                                                            </div>

                                                            <p className="text-sm text-slate-500 mt-1 max-w-md truncate">
                                                                {task.description ||
                                                                    "No description"}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <UserRound
                                                                    size={
                                                                        17
                                                                    }
                                                                    className="text-blue-600"
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="font-medium text-slate-900">
                                                                    {employee?.name ||
                                                                        "Not assigned"}
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {employee?.employeeId ||
                                                                        "N/A"}{" "}
                                                                    •{" "}
                                                                    {role}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`
                                                                inline-flex
                                                                px-2.5 py-1
                                                                rounded-md
                                                                text-xs
                                                                font-semibold
                                                                ${priorityConfig[
                                                                task
                                                                    .priority
                                                                ]}
                                                            `}
                                                        >
                                                            {task.priority.toUpperCase()}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-2.5 py-1.5
                                                                rounded-md
                                                                border
                                                                text-xs
                                                                font-semibold
                                                                ${status.className}
                                                            `}
                                                        >
                                                            <StatusIcon
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            {
                                                                status.label
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-5 text-sm text-slate-600">
                                                        {formatDate(
                                                            task.dueDate
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-5 text-sm text-slate-600">
                                                        {formatDate(
                                                            task.createdAt
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden divide-y divide-slate-100">
                                {filteredTasks.map((task) => {
                                    const employee =
                                        getEmployee(task);

                                    const role =
                                        getEmployeeRole(task);

                                    const status =
                                        statusConfig[
                                        task.status
                                        ];

                                    const StatusIcon =
                                        status.icon;

                                    return (
                                        <div
                                            key={task._id}
                                            onClick={() =>
                                                setSelectedTask(
                                                    task
                                                )
                                            }
                                            className="p-5 hover:bg-slate-50 cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-slate-900 truncate">
                                                        {
                                                            task.title
                                                        }
                                                    </h3>

                                                    <p className="text-xs text-slate-400 mt-1">
                                                        #
                                                        {
                                                            task.taskId
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    className={`
                                                        shrink-0
                                                        inline-flex
                                                        items-center
                                                        gap-1
                                                        px-2 py-1
                                                        rounded-md
                                                        border
                                                        text-xs
                                                        font-medium
                                                        ${status.className}
                                                    `}
                                                >
                                                    <StatusIcon
                                                        size={13}
                                                    />

                                                    {
                                                        status.label
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <UserRound
                                                        size={17}
                                                        className="text-blue-600"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {employee?.name ||
                                                            "Not assigned"}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {employee?.employeeId ||
                                                            "N/A"}{" "}
                                                        •{" "}
                                                        {role}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-4">
                                                <span
                                                    className={`
                                                        px-2.5 py-1
                                                        rounded-md
                                                        text-xs
                                                        font-medium
                                                        ${priorityConfig[
                                                        task
                                                            .priority
                                                        ]}
                                                    `}
                                                >
                                                    {task.priority.toUpperCase()}
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    Due:{" "}
                                                    {formatDate(
                                                        task.dueDate
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Task Details Modal */}
            {selectedTask && (
                <div
                    className="
                        fixed inset-0 z-50
                        bg-black/50
                        flex items-center justify-center
                        p-4
                    "
                    onClick={() => setSelectedTask(null)}
                >
                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="
                            bg-white
                            w-full max-w-xl
                            max-h-[90vh]
                            overflow-y-auto
                            rounded-2xl
                            shadow-2xl
                        "
                    >
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        #
                                        {
                                            selectedTask.taskId
                                        }
                                    </p>

                                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                                        {
                                            selectedTask.title
                                        }
                                    </h2>
                                </div>

                                <button
                                    onClick={() =>
                                        setSelectedTask(
                                            null
                                        )
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 mb-2">
                                    Description
                                </p>

                                <p className="text-sm text-slate-600 leading-6">
                                    {selectedTask.description ||
                                        "No description provided."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <DetailBox
                                    label="Status"
                                    value={
                                        statusConfig[
                                            selectedTask
                                                .status
                                        ].label
                                    }
                                />

                                <DetailBox
                                    label="Priority"
                                    value={selectedTask.priority.toUpperCase()}
                                />

                                <DetailBox
                                    label="Created"
                                    value={formatDate(
                                        selectedTask.createdAt
                                    )}
                                />

                                <DetailBox
                                    label="Due Date"
                                    value={formatDate(
                                        selectedTask.dueDate
                                    )}
                                />
                            </div>

                            <div className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <UserRound
                                            size={18}
                                            className="text-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Assigned To
                                        </p>

                                        <p className="font-semibold text-slate-900">
                                            {getEmployee(
                                                selectedTask
                                            )?.name ||
                                                "Not assigned"}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {getEmployee(
                                                selectedTask
                                            )?.employeeId ||
                                                "N/A"}{" "}
                                            •{" "}
                                            {getEmployeeRole(
                                                selectedTask
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedTask.manager && (
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <p className="text-xs text-slate-500">
                                        Assigned By Manager
                                    </p>

                                    <p className="font-semibold text-slate-900 mt-1">
                                        {
                                            selectedTask.manager
                                                .name
                                        }
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        ID:{" "}
                                        {
                                            selectedTask.manager
                                                .employeeId
                                        }
                                    </p>
                                </div>
                            )}

                            {/* View only */}
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays
                                        size={17}
                                        className="text-slate-500"
                                    />

                                    <p className="text-sm text-slate-600">
                                        Admin view only — task status
                                        cannot be changed here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
    title,
    value,
    icon,
    className,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    className: string;
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        {value}
                    </p>
                </div>

                <div
                    className={`
                        w-11 h-11
                        rounded-xl
                        flex items-center justify-center
                        ${className}
                    `}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

/* =========================
   DETAIL BOX
========================= */

function DetailBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="font-semibold text-slate-900 mt-1">
                {value}
            </p>
        </div>
    );
}