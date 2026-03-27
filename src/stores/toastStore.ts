import { create } from "zustand";

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastItem {
    id: string;
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
}

interface ToastStore {
    toasts: ToastItem[];
    add: (toast: Omit<ToastItem, "id">) => void;
    remove: (id: string) => void;
}

// Счетчик на уровне модуля безопасен, потому что этот модуль 
// является синглтоном в комплекте.
let _nextId = 0;

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    add: (toast) =>
        set((s) => ({
            toasts: [...s.toasts, { ...toast, id: String(++_nextId) }],
        })),

    remove: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));