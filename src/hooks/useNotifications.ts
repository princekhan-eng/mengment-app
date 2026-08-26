import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { INotif } from "@/components/NotificationCenter";

interface NotificationsResponse {
    success: boolean;
    notifications: INotif[];
    unreadCount: number;
}

export function useNotifications(recipientId: string) {
    const queryClient = useQueryClient();

    const query = useQuery<NotificationsResponse>({
        queryKey: ["notifications", recipientId],
        queryFn: async () => {
            if (!recipientId) return { success: true, notifications: [], unreadCount: 0 };
            const res = await fetch(`/API/notifications?recipientId=${encodeURIComponent(recipientId)}`);
            const data = await res.json();
            if (data.success) {
                return {
                    success: true,
                    notifications: data.notifications || [],
                    unreadCount: data.unreadCount || 0,
                };
            }
            throw new Error(data.message || "Failed to fetch notifications");
        },
        enabled: Boolean(recipientId),
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await fetch("/API/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", recipientId] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/API/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientId, markAll: true }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", recipientId] });
        },
    });

    const clearAllMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(
                `/API/notifications?recipientId=${encodeURIComponent(recipientId)}&clearAll=true`,
                { method: "DELETE" }
            );
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", recipientId] });
        },
    });

    const deleteNotificationMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await fetch(
                `/API/notifications?notificationId=${encodeURIComponent(notificationId)}`,
                { method: "DELETE" }
            );
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", recipientId] });
        },
    });

    return {
        notifications: query.data?.notifications || [],
        unreadCount: query.data?.unreadCount || 0,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
        markAsRead: markAsReadMutation.mutate,
        markAllRead: markAllReadMutation.mutate,
        clearAll: clearAllMutation.mutate,
        deleteNotification: deleteNotificationMutation.mutate,
    };
}
