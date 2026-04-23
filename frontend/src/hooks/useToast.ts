// Реэкспорт хранилища и типов — потребителям не нужно знать,
// где они физически лежат, достаточно импортировать из этого файла.
export { useToastStore } from "@/stores/toastStore";
export type { ToastItem, ToastVariant } from "@/stores/toastStore";

import { useToastStore } from "@/stores/toastStore";
import type { ToastItem } from "@/stores/toastStore";

// -------------------------------------------------------------
// useToast — удобная обёртка над toastStore
// -------------------------------------------------------------

export function useToast() {
  const add = useToastStore((s) => s.add);

  return {
    /** Полный контроль — передаёте все поля вручную */
    toast: (opts: Omit<ToastItem, "id">) => add(opts),

    /** Зелёное уведомление об успехе */
    success: (title: string, description?: string) =>
      add({ title, description, variant: "success" }),

    /** Красное уведомление об ошибке */
    error: (title: string, description?: string) =>
      add({ title, description, variant: "destructive" }),
  };
}
