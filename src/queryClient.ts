import { QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/api/client";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Данные считаются свежими в течение 30 секунд — повторная 
            // выборка при каждом фокусировании отсутствует
            staleTime: 30_000,

            // Повторяnm попытку только при ошибках сети 
            // сервера, а не при ошибках клиента 4xx
            retry: (failureCount, error) => {
                if (error instanceof ApiRequestError && error.status < 500) {
                    return false;
                }
                return failureCount < 2;
            },

            // Отображение устаревших данных при загрузке 
            // новых данных — мерцание при загрузке отсутствует
            placeholderData: (prev: unknown) => prev,
        },
        mutations: {
            retry: false,
        },
    },
});