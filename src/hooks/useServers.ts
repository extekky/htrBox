import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
    getServers,
    getServersAdmin,
    createServer,
    updateServer,
    deleteServer,
} from "@/api/servers";

import type {
    ServerPublicResponse,
    ServerAdminResponse,
    CreateServerRequest,
    UpdateServerRequest,
} from "@/api/types";

// -------------------------------------------------------------
// Фабрика ключей запросов
// -------------------------------------------------------------

export const SERVER_KEYS = {
    all: ["servers"] as const,
    list: ["servers", "list"] as const,
    admin: ["servers", "admin"] as const,
} as const;

// -------------------------------------------------------------
// Запросы
// -------------------------------------------------------------

/** Возвращает публичный (пользовательский) список серверов.
 * Только основные поля: id, country, city, active.
 *Отсортирован по стране и городу в алфавитном порядке.
 *Используется на пользовательских страницах (например, выбор сервера в профиле). */
export function useServers() {
    return useQuery<ServerPublicResponse[]>({
        queryKey: SERVER_KEYS.list,
        queryFn: getServers,
        select: (data) =>
            [...data].sort((a, b) =>
                `${a.country} ${a.city}`.localeCompare(`${b.country} ${b.city}`),
            ),
        // staleTime наследуется из глобальной конфигурации queryClient (~30с)
    });
}

// -------------------------------------------------------------
// Возвращает полный список серверов для администратора со всеми полями.
// Включает чувствительные данные: ip, port, hysteria_url, label и др.
// Отсортирован по стране и городу в алфавитном порядке.
//
// Используется в панели администратора / таблице управления серверами.
// -------------------------------------------------------------
export function useServersAdmin() {
    return useQuery<ServerAdminResponse[]>({
        queryKey: SERVER_KEYS.admin,
        queryFn: getServersAdmin,
        select: (data) =>
            [...data].sort((a, b) =>
                `${a.country} ${a.city}`.localeCompare(`${b.country} ${b.city}`),
            ),
        // staleTime наследуется из глобальной конфигурации
    });
}

// -------------------------------------------------------------
// Мутации
// -------------------------------------------------------------

// Создаёт новый сервер.
// После успешного выполнения инвалидирует публичный и админский списки.
// -------------------------------------------------------------
export function useCreateServer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateServerRequest) => createServer(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SERVER_KEYS.list });
            queryClient.invalidateQueries({ queryKey: SERVER_KEYS.admin });
        },

        // Опционально: можно добавить оптимистичное добавление для мгновенного обновления UI
        // onMutate: async (newServer) => { ... }
    });
}

// -------------------------------------------------------------
// Обновляет существующий сервер по ID.
// После успешного выполнения инвалидирует оба списка.
// -------------------------------------------------------------
export function useUpdateServer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateServerRequest }) =>
            updateServer(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SERVER_KEYS.list });
            queryClient.invalidateQueries({ queryKey: SERVER_KEYS.admin });
        },

        // При необходимости можно добавить оптимистичное обновление (аналогично удалению)
    });
}

// -------------------------------------------------------------
// Удаляет сервер по ID с оптимистичным удалением из админского списка.
// При ошибке выполняет откат, после завершения инвалидирует оба списка.
// -------------------------------------------------------------
export function useDeleteServer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (serverId: string) => deleteServer(serverId),

        onMutate: async (serverId: string) => {
            // Отменяем активные запросы, чтобы не перезаписать оптимистичное обновление
            await queryClient.cancelQueries({ queryKey: SERVER_KEYS.admin });

            // Сохраняем предыдущее состояние для возможного отката
            const previousServers = queryClient.getQueryData<ServerAdminResponse[]>(
                SERVER_KEYS.admin,
            );

            // Оптимистично удаляем сервер из админского списка
            queryClient.setQueryData<ServerAdminResponse[]>(SERVER_KEYS.admin, (old = []) =>
                old.filter((server) => server.id !== serverId),
            );

            // Возвращаем контекст с предыдущим состоянием для отката
            return { previousServers };
        },

        onError: (_err, _serverId, context) => {
            // Откат к предыдущему состоянию при ошибке
            if (context?.previousServers) {
                queryClient.setQueryData(SERVER_KEYS.admin, context.previousServers);
            }
        },

        onSettled: () => {
            // Всегда перезапрашиваем оба списка для обеспечения консистентности
            queryClient.invalidateQueries({ queryKey: SERVER_KEYS.list });
            queryClient.invalidateQueries({ queryKey: SERVER_KEYS.admin });
        },
    });
}