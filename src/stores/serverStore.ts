import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ServerPublicResponse } from "@/api/types";

interface ServerStore {
    selectedServer: ServerPublicResponse | null;
    urlMap: Record<string, string>; // serverId -> connection URL
    setSelectedServer: (server: ServerPublicResponse | null) => void;
    setUrlMap: (map: Record<string, string>) => void;
    clearServer: () => void;
}

export const useServerStore = create<ServerStore>()(
    persist(
        (set) => ({
            selectedServer: null,
            urlMap: {},
            setSelectedServer: (server) => set({ selectedServer: server }),
            setUrlMap: (map) => set({ urlMap: map }),
            clearServer: () => set({ selectedServer: null, urlMap: {} }),
        }),
        {
            name: "server-store",
            partialize: (state) => ({
                selectedServer: state.selectedServer,
                urlMap: state.urlMap,
            }),
        },
    ),
);

// Selectors
export const selectSelectedServer = (s: ServerStore) => s.selectedServer;
export const selectSetSelectedServer = (s: ServerStore) => s.setSelectedServer;
export const selectClearServer = (s: ServerStore) => s.clearServer;
export const selectUrlMap = (s: ServerStore) => s.urlMap;
export const selectConnectionUrl = (serverId: string | null) =>
    (s: ServerStore) => (serverId ? s.urlMap[serverId] ?? null : null);