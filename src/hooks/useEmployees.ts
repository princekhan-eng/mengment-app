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
                const list: any[] = Array.isArray(res.data.developers) ? res.data.developers.flat() : [];
                return Array.from(
                    new Map(list.filter(Boolean).map((d: any) => [d._id || d.employeeId || d.email, d])).values()
                );
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
                const list: any[] = Array.isArray(res.data.testers) ? res.data.testers.flat() : [];
                return Array.from(
                    new Map(list.filter(Boolean).map((t: any) => [t._id || t.employeeId || t.email, t])).values()
                );
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
