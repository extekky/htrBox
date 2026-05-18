import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/authStore";

import {
  getUsers,
  getMe,
  createUser,
  updateUser,
  deleteUser,
  setRole,
  changePassword,
  regenerateHy,
} from "@/api/users";

import { kickUsers, resetTraffic } from "@/api/hysteria";

import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  SetRoleRequest,
  ChangePasswordRequest,
} from "@/api/types";

// -------------------------------------------------------------
// Фабрика ключей запросов — единый источник истины для инвалидации
// -------------------------------------------------------------

export const USER_KEYS = {
  all: ["users"] as const,
  list: ["users", "list"] as const,
  me: ["users", "me"] as const,
} as const;

// -------------------------------------------------------------
// Запросы
// -------------------------------------------------------------

/**
 * Загружает полный список пользователей (только для администраторов).
 * Сортируется по имени пользователя для единообразного отображения в таблицах.
 */
export function useUsers() {
  return useQuery<UserResponse[]>({
    queryKey: USER_KEYS.list,
    queryFn: getUsers,
    // staleTime наследуется из глобального конфига (~30s)
  });
}

/**
 * Загружает профиль текущего авторизованного пользователя (/me).
 * Автоматически отключается, если токен отсутствует в auth store.
 */
export function useMe() {
  const token = useAuthStore((state) => state.token);

  return useQuery<UserResponse>({
    queryKey: USER_KEYS.me,
    queryFn: getMe,
    enabled: !!token,
    // staleTime наследуется из глобального конфига
  });
}

// -------------------------------------------------------------
// Мутации
// -------------------------------------------------------------

/**
 * Создаёт нового пользователя.
 * Инвалидирует список пользователей при успехе.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserRequest) => createUser(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
    },
  });
}

/**
 * Обновляет данные существующего пользователя по имени.
 * Инвалидирует список пользователей при успехе.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      username,
      data,
    }: {
      username: string;
      data: UpdateUserRequest;
    }) => updateUser(username, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
      // При обновлении себя — можно также инвалидировать .me, но обычно это отдельный флоу
    },
  });
}

/**
 * Удаляет пользователя по имени с оптимистичным удалением из списка.
 * Откатывает изменения при ошибке, перезапрашивает данные после завершения.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => deleteUser(username),

    onMutate: async (username: string) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.list });

      const previousUsers = queryClient.getQueryData<UserResponse[]>(
        USER_KEYS.list,
      );

      queryClient.setQueryData<UserResponse[]>(USER_KEYS.list, (old = []) =>
        old.filter((user) => user.username !== username),
      );

      return { previousUsers };
    },

    onError: (_err, _username, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USER_KEYS.list, context.previousUsers);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
    },
  });
}

/**
 * Изменяет роль пользователя (admin <-> user).
 * Инвалидирует список пользователей при успехе.
 */
export function useSetRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      username,
      data,
    }: {
      username: string;
      data: SetRoleRequest;
    }) => setRole(username, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
    },
  });
}

/**
 * Меняет пароль пользователя (действие администратора).
 * Не инвалидирует список — смена пароля не влияет на отображаемые данные.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      username,
      data,
    }: {
      username: string;
      data: ChangePasswordRequest;
    }) => changePassword(username, data),
    // Инвалидация не нужна — данные списка не меняются
  });
}

/**
 * Перегенерирует пароль Hysteria 2 для пользователя.
 * Инвалидирует список пользователей (для админ-панели) и
 * запроса /me (при обновлении профиля пользователя).
 */
export function useRegenerateHy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => regenerateHy(username),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
}

/**
 * Массово отключает и блокирует выбранных пользователей через Hysteria.
 * Инвалидирует список пользователей для обновления статусов active/allowed.
 */
export function useKickUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usernames: string[]) => kickUsers(usernames),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
    },

    // Можно добавить оптимистичное обновление для мгновенной смены бейджа "blocked"
    // onMutate: async (usernames) => { ... установить allowed/active=false оптимистично }
  });
}

/**
 * Сбрасывает накопительный счётчик трафика пользователя до нуля.
 * Только для администраторов.
 */
export function useResetTraffic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => resetTraffic(username),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
    },
  });
}
