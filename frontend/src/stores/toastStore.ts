import { create } from "zustand";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  // Длительность показа в миллисекундах
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];

  /**
   * Добавить новое уведомление в очередь.
   * id генерируется автоматически.
   */
  add: (toast: Omit<ToastItem, "id">) => void;

  /**
   * Удалить уведомление из очереди по id.
   * Вызывается после завершения анимации скрытия.
   */
  remove: (id: string) => void;
}

// -------------------------------------------------------------
// Счётчик id
// -------------------------------------------------------------

// Модульный счётчик безопасен, так как модуль является
// синглтоном в рамках бандла — id всегда уникальны.
let _nextId = 0;

// -------------------------------------------------------------
// Стор
// -------------------------------------------------------------

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: String(++_nextId) }],
    })),

  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
