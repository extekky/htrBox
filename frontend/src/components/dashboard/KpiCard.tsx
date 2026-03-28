import { cn } from "@/lib/cn";

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface KpiProps {
    label: string;
    value: number | string;
    sub?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accent?: "blue" | "green" | "red" | "amber" | "purple" | "default";
}

// -------------------------------------------------------------
// Конфигурация акцентов
// Определяет цвета фона, границ, иконок и значений для разных типов карточек.
// -------------------------------------------------------------

const ACCENT_MAP = {
    blue: { bg: "bg-blue-500/8", border: "border-blue-500/20", icon: "bg-blue-500/12 text-blue-400", val: "text-blue-400" },
    green: { bg: "bg-emerald-500/8", border: "border-emerald-500/20", icon: "bg-emerald-500/12 text-emerald-400", val: "text-emerald-400" },
    red: { bg: "bg-rose-500/8", border: "border-rose-500/20", icon: "bg-rose-500/12 text-rose-400", val: "text-rose-400" },
    amber: { bg: "bg-amber-500/8", border: "border-amber-500/20", icon: "bg-amber-500/12 text-amber-400", val: "text-amber-400" },
    purple: { bg: "bg-purple-500/8", border: "border-purple-500/20", icon: "bg-purple-500/12 text-purple-400", val: "text-purple-400" },
    default: { bg: "bg-card", border: "border-border", icon: "bg-muted text-muted-foreground", val: "text-foreground" },
};

// -------------------------------------------------------------
// Компонент карточки KPI
// -------------------------------------------------------------

/**
 * Отображает ключевой показатель эффективности (KPI) с иконкой и опциональной подписью.
 * Поддерживает различные цветовые акценты через пропс accent.
 */
export function KpiCard({ label, value, sub, icon: Icon, accent = "default" }: KpiProps) {
    const c = ACCENT_MAP[accent];

    return (
        <div className={cn(
            "relative rounded-2xl border p-5 flex flex-col gap-3 overflow-hidden transition-all duration-200 hover:shadow-md",
            c.bg, c.border,
        )}>
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {label}
                </span>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", c.icon)}>
                    <Icon size={15} />
                </div>
            </div>

            <div>
                <p className={cn("text-3xl font-black tabular-nums leading-none", c.val)}>
                    {value}
                </p>
                {/* Дополнительная информация под основным значением */}
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
        </div>
    );
}
