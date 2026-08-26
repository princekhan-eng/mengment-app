import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface TaskFile {
    fileId: string;
    name: string;
    url: string;
    fileType?: string;
    size?: number;
    thumbnailUrl?: string;
    filePath?: string;
}

export interface Task {
    _id: string;
    taskId?: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in-progress" | "completed";
    testingResult?: string;
    employeeId?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt?: string;
    assignedTo?: any;
    assignedToRole?: "developer" | "tester";
    developer?: any;
    manager?: {
        _id: string;
        name: string;
        employeeId: string;
    };
    files?: TaskFile[];
}

export interface CreateTaskPayload {
    title: string;
    description: string;
    assignedTo: string;
    assignedToRole: "developer" | "tester";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
}

// Query for Manager / Admin all tasks
export function useAllTasks() {
    return useQuery<Task[]>({
        queryKey: ["tasks", "all"],
        queryFn: async () => {
            const res = await axios.get("/API/admin/getalltask");
            if (res.data && res.data.success) {
                return res.data.tasks || [];
            }
            return res.data?.tasks || [];
        },
    });
}

// Query for Developer tasks
export function useDeveloperTasks() {
    return useQuery<Task[]>({
        queryKey: ["tasks", "developer"],
        queryFn: async () => {
            const res = await axios.get("/API/developer/gettask");
            if (res.data && res.data.success) {
                return res.data.tasks || [];
            }
            return [];
        },
    });
}

// Query for Tester tasks
export function useTesterTasks() {
    return useQuery<Task[]>({
        queryKey: ["tasks", "tester"],
        queryFn: async () => {
            const res = await axios.get("/API/tester/gettask");
            if (res.data && res.data.success) {
                return res.data.tasks || [];
            }
            return [];
        },
    });
}

// Mutation to create task
export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateTaskPayload) => {
            const res = await axios.post("/API/manager/createtask", payload);
            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to create task");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}

// Mutation to update task status by Developer
export function useUpdateDeveloperTaskStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: Task["status"] }) => {
            const res = await axios.patch(`/API/developer/tasks/${taskId}`, { status });
            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to update task status");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}

// Mutation to update task status by Tester
export function useUpdateTesterTaskStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: Task["status"] }) => {
            const res = await axios.patch(`/API/tester/tasks/${taskId}`, { status });
            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to update task status");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}
