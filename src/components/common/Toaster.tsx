import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";

import { useToastStore } from "@/stores/toastStore";
import type { ToastItem, ToastVariant } from "@/stores/toastStore";
import { cn } from "@/lib/cn";

// -------------------------------------------------------------
// Стили по вариантам
// -------------------------------------------------------------

const VARIANT_ROOT: Record<ToastVariant, string> = {
    default: "bg-card text-card-foreground border-border",
    destructive: "bg-destructive/10 border-destructive/30 text-destructive-foreground",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-foreground",
};

const VARIANT_PROGRESS: Record<ToastVariant, string> = {
    default: "bg-muted-foreground/50",
    destructive: "bg-destructive",
    success: "bg-emerald-500",
};

// -------------------------------------------------------------
// ToastViewport — точка монтирования уведомлений в DOM
// -------------------------------------------------------------

function ToastViewport() {
    return (
        <ToastPrimitives.Viewport
            className={cn(
                "fixed bottom-4 right-4 z-100 outline-none",
                "flex max-h-screen w-full max-w-104 flex-col-reverse gap-2 p-4",
                "sm:bottom-8 sm:right-8 sm:flex-col sm:p-0",
            )}
        />
    );
}

// -------------------------------------------------------------
// ToastItem — одно уведомление
// -------------------------------------------------------------

type ToastItemProps = Required<Pick<ToastItem, "id" | "variant" | "duration">>
    & Pick<ToastItem, "title" | "description">
    & { onRemove: (id: string) => void };

function ToastItem({
    id,
    title,
    description,
    variant = "default",
    duration = 3000,
    onRemove,
}: ToastItemProps) {
    return (
        <ToastPrimitives.Root
            duration={duration}
            onOpenChange={(open) => { if (!open) onRemove(id); }}
            className={cn(
                // Базовые стили
                "group relative w-full overflow-hidden rounded-lg border p-4 shadow-lg",
                // Анимации входа / выхода (Radix data-state)
                "data-[state=open]:animate-in  data-[state=open]:fade-in",
                "data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
                "data-[state=closed]:slide-out-to-right-full",
                VARIANT_ROOT[variant],
            )}
        >
            {/* Прогресс-бар (требует @keyframes shrink в глобальных стилях) */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 h-1 origin-left animate-shrink",
                    VARIANT_PROGRESS[variant],
                )}
            />

            <div className="flex items-start justify-between gap-3">
                {/* Текстовый блок */}
                <div className="grid flex-1 gap-1">
                    {title && (
                        <ToastPrimitives.Title className="text-sm font-semibold leading-tight">
                            {title}
                        </ToastPrimitives.Title>
                    )}
                    {description && (
                        <ToastPrimitives.Description className="text-sm leading-relaxed text-muted-foreground">
                            {description}
                        </ToastPrimitives.Description>
                    )}
                </div>

                {/* Кнопка закрытия */}
                <ToastPrimitives.Close
                    aria-label="Закрыть уведомление"
                    className={cn(
                        "rounded-md p-1.5 text-muted-foreground opacity-70",
                        "transition-opacity hover:opacity-100 focus:opacity-100",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    )}
                >
                    <X className="h-4 w-4" />
                </ToastPrimitives.Close>
            </div>
        </ToastPrimitives.Root>
    );
}

// -------------------------------------------------------------
// Toaster — корневой компонент; монтируется один раз в App.tsx
// -------------------------------------------------------------

export function Toaster() {
    const { toasts, remove } = useToastStore();

    return (
        <ToastPrimitives.Provider swipeDirection="right">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    title={toast.title}
                    description={toast.description}
                    variant={toast.variant ?? "default"}
                    duration={toast.duration ?? 3000}
                    onRemove={remove}
                />
            ))}
            <ToastViewport />
        </ToastPrimitives.Provider>
    );
}