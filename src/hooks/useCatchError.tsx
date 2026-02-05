import axios, { AxiosResponse } from "axios";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/store/hooks";

interface ErrorResponse {
    status?: boolean;
    error?: string;
    errorType?: string;
    message?: string | Record<string, string | string[]>;
}

export default function useCatchError() {
    const dispatch = useAppDispatch();

    const handleErrorResponse = useCallback(
        (data: unknown, status: number) => {
            const errorData = data as ErrorResponse;

            // Skip if error has status property (success response)
            if (errorData?.status) {
                return;
            }

            // Handle 401 unauthorized errors
            if (status === 401) {
                // Cookies.remove("sub", { path: "/" });
                // dispatch(REMOVE_USER());
                return;
            }

            // Handle error field (new format)
            if (errorData?.error && typeof errorData.error === "string") {
                toast.error(errorData.error);
                return;
            }

            // Handle message field (legacy format - string)
            if (typeof errorData?.message === "string") {
                toast.error(errorData.message);
                return;
            }

            // Handle object message (validation errors)
            if (errorData?.message && typeof errorData.message === "object") {
                for (const key in errorData.message) {
                    const messages = errorData.message[key];
                    if (Array.isArray(messages)) {
                        messages.forEach((message) => toast.error(message));
                    } else if (typeof messages === "string") {
                        toast.error(messages);
                    }
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dispatch]
    );

    useEffect(() => {
        axios.interceptors.response.use(
            function (response: AxiosResponse<unknown>) {
                return response;
            },
            function (error) {
                const status = error.response?.status ?? 500;
                handleErrorResponse(error.response?.data, status);
                return Promise.reject(error);
            }
        );
    }, [handleErrorResponse]);

    return null;
}
