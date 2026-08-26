import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    isActive?: boolean;
    role?: string;
}

export function useDevelopers() {
    return useQuery<Employee[]>({
        queryKey: ["developers"],
        queryFn: async () => {
            const res = await axios.get("/API/manager/getdevloper");
            if (res.data && res.data.developers) {
                return res.data.developers.flat();
            }
            return [];
        },
    });
}

export function useTesters() {
    return useQuery<Employee[]>({
        queryKey: ["testers"],
        queryFn: async () => {
            const res = await axios.get("/API/getemply/tester");
            if (res.data && res.data.testers) {
                return res.data.testers;
            }
            return [];
        },
    });
}

export function useEmployeeById(employeeId: string | null) {
    return useQuery<Employee | null>({
        queryKey: ["employee", employeeId],
        queryFn: async () => {
            if (!employeeId) return null;
            const res = await axios.get(`/API/getemply/developer/${employeeId}`);
            if (res.data && res.data.success) {
                return res.data.developer || null;
            }
            throw new Error(res.data?.message || "Failed to fetch employee");
        },
        enabled: Boolean(employeeId),
    });
}
