import { X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNotifyBanner } from "@/hooks/useNotify";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

type BannerVariant = "amber" | "red" | "blue" | "green" | "default";

interface NotifyBannerProps {
    /** Уникальный ключ баннера — используется для хранения в sessionStorage */
    bannerId: string;
    /** Условие отображения баннера (например, !profile.active) */
    visible: boolean;
    /** Иконка из lucide-react */
    icon: LucideIcon;
    /** Заголовок */
    title: string;
    /** Подпись под заголовком */
    description?: string;
    /** Цветовая схема */
    variant?: BannerVariant;
    className?: string;
}

// -------------------------------------------------------------
// Цветовые схемы
// -------------------------------------------------------------

const variantStyles: Record<BannerVariant, {
    wrapper: string;
    icon: string;
    iconWrap: string;
    title: string;
    close: string;
}> = {
    amber: {
        wrapper: "border-amber-500/20 bg-amber-500/10",
        icon: "text-amber-500",
        iconWrap: "bg-amber-500/15 text-amber-500",
        title: "text-amber-500",
        close: "text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/15",
    },
    red: {
        wrapper: "border-destructive/20 bg-destructive/10",
        icon: "text-destructive",
        iconWrap: "bg-destructive/15 text-destructive",
        title: "text-destructive",
        close: "text-destructive/70 hover:text-destructive hover:bg-destructive/15",
    },
    blue: {
        wrapper: "border-blue-500/20 bg-blue-500/10",
        icon: "text-blue-500",
        iconWrap: "bg-blue-500/15 text-blue-500",
        title: "text-blue-500",
        close: "text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/15",
    },
    green: {
        wrapper: "border-emerald-500/20 bg-emerald-500/10",
        icon: "text-emerald-500",
        iconWrap: "bg-emerald-500/15 text-emerald-500",
        title: "text-emerald-500",
        close: "text-emerald-500/70 hover:text-emerald-500 hover:bg-emerald-500/15",
    },
    default: {
        wrapper: "border-border bg-muted",
        icon: "text-muted-foreground",
        iconWrap: "bg-muted text-muted-foreground",
        title: "text-foreground",
        close: "text-muted-foreground hover:text-foreground hover:bg-muted",
    },
};

// -------------------------------------------------------------
// Компонент
// -------------------------------------------------------------

export function NotifyBanner({
    bannerId,
    visible: isEligible,
    icon: Icon,
    title,
    description,
    variant = "amber",
    className,
}: NotifyBannerProps) {
    const { visible, dismiss } = useNotifyBanner(bannerId, isEligible);
    const s = variantStyles[variant];

    if (!visible) return null;

    return (
        <div
            className={cn(
                "rounded-2xl border px-4 py-3.5 flex items-center gap-3",
                s.wrapper,
                className,
            )}
        >
            {/* Иконка */}
            <div
                className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl shrink-0",
                    s.iconWrap,
                )}
            >
                <Icon size={16} />
            </div>

            {/* Текст */}
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", s.title)}>
                    {title}
                </p>

                {description && (
                    <p
                        className={cn(
                            "text-xs text-muted-foreground mt-0.5 whitespace-pre-line",
                        )}
                    >
                        {description}
                    </p>
                )}
            </div>

            {/* Крестик */}
            <button
                onClick={dismiss}
                aria-label="Закрыть"
                className={cn(
                    "shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                    s.close,
                )}
            >
                <X size={15} />
            </button>
        </div>
    );
}