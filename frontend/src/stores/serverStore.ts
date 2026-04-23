import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ServerPublicResponse } from "@/api/types";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

interface ServerStore {
  // Выбранный пользователем сервер
  selectedServer: ServerPublicResponse | null;

  // Список активных серверов, загружается при инициализации
  servers: ServerPublicResponse[];

  // Карта serverId -> URL подключения (Hysteria2 / другой протокол)
  urlMap: Record<string, string>;

  setSelectedServer: (server: ServerPublicResponse | null) => void;
  setServers: (servers: ServerPublicResponse[]) => void;
  setUrlMap: (map: Record<string, string>) => void;
  clearServer: () => void;
}

// -------------------------------------------------------------
// Стор
// -------------------------------------------------------------

export const useServerStore = create<ServerStore>()(
  persist(
    (set) => ({
      selectedServer: null,
      servers: [],
      urlMap: {},

      /**
       * Установить активный сервер.
       * Передай null чтобы сбросить выбор.
       */
      setSelectedServer: (server) => set({ selectedServer: server }),

      /**
       * Сохранить список активных серверов.
       * Вызывается из initServerData после загрузки с бэкенда.
       */
      setServers: (servers) => set({ servers }),

      /**
       * Сохранить карту URL подключений для всех серверов.
       * Вызывается после загрузки списка серверов с бэкенда.
       */
      setUrlMap: (map) => set({ urlMap: map }),

      /**
       * Сбросить выбранный сервер и все URL подключений.
       * Вызывается при выходе из аккаунта (clearAuth).
       */
      clearServer: () => set({ selectedServer: null, servers: [], urlMap: {} }),
    }),
    {
      // Ключ в localStorage
      name: "server-store",

      // Персистим только данные, но не методы
      partialize: (state) => ({
        selectedServer: state.selectedServer,
        servers: state.servers,
        urlMap: state.urlMap,
      }),
    },
  ),
);

// -------------------------------------------------------------
// Селекторы
// -------------------------------------------------------------

// Используются для подписки на конкретное поле стора
// без лишних ре-рендеров: useServerStore(selectSelectedServer)

export const selectSelectedServer = (s: ServerStore) => s.selectedServer;
export const selectSetSelectedServer = (s: ServerStore) => s.setSelectedServer;
export const selectClearServer = (s: ServerStore) => s.clearServer;
export const selectUrlMap = (s: ServerStore) => s.urlMap;
export const selectServers = (s: ServerStore) => s.servers;

/**
 * Фабрика селектора — возвращает URL подключения для конкретного сервера.
 * Использование: useServerStore(selectConnectionUrl(serverId))
 */
export const selectConnectionUrl =
  (serverId: string | null) => (s: ServerStore) =>
    serverId ? (s.urlMap[serverId] ?? null) : null;
