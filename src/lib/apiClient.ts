import axios from "axios";

const apiClient = axios.create({
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/API/auth/login") &&
            !originalRequest.url?.includes("/API/auth/refreshtoken")
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                // Call Refresh Token API
                const refreshRes = await axios.post(
                    "/API/auth/refreshtoken",
                    {},
                    { withCredentials: true }
                );

                if (refreshRes.data && refreshRes.data.success) {
                    processQueue();
                    isRefreshing = false;
                    return apiClient(originalRequest);
                } else {
                    processQueue(error);
                    isRefreshing = false;
                    if (typeof window !== "undefined") {
                        window.location.href = "/auth/login";
                    }
                    return Promise.reject(error);
                }
            } catch (refreshErr) {
                processQueue(refreshErr);
                isRefreshing = false;
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login";
                }
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
