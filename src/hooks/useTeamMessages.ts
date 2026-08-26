import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface MessageItem {
    _id?: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    receiverId?: string;
    roomId: string;
    content: string;
    attachments?: Array<{
        fileId?: string;
        name: string;
        url: string;
        fileType?: string;
        filePath?: string;
        thumbnailUrl?: string;
    }>;
    createdAt?: string | Date;
}

export function useTeamMessages(roomId: string) {
    const queryClient = useQueryClient();

    const query = useQuery<MessageItem[]>({
        queryKey: ["messages", roomId],
        queryFn: async () => {
            if (!roomId) return [];
            const res = await fetch(`/API/messages?roomId=${encodeURIComponent(roomId)}`);
            const data = await res.json();
            if (data.success) {
                return data.messages || [];
            }
            return [];
        },
        enabled: Boolean(roomId),
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (msgData: MessageItem) => {
            const res = await fetch("/API/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(msgData),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
        },
    });

    const deleteMessageMutation = useMutation({
        mutationFn: async (messageId: string) => {
            const res = await fetch(`/API/messages/${messageId}`, { method: "DELETE" });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
        },
    });

    const clearRoomMutation = useMutation({
        mutationFn: async (targetRoomId: string) => {
            const res = await fetch(`/API/messages?roomId=${encodeURIComponent(targetRoomId)}`, { method: "DELETE" });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
        },
    });

    return {
        messages: query.data || [],
        isLoading: query.isLoading,
        refetch: query.refetch,
        sendMessage: sendMessageMutation.mutateAsync,
        deleteMessage: deleteMessageMutation.mutateAsync,
        clearRoom: clearRoomMutation.mutateAsync,
    };
}
