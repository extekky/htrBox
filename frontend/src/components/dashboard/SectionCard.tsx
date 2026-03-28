// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface SectionCardProps {
    title: string;
    badge?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
}

// -------------------------------------------------------------
// Компоненты секций
// -------------------------------------------------------------

/**
 * Основной контейнер для секций в админ-панели.
 * Включает заголовок с опциональным бейджем и действием, а также область контента.
 */
export function SectionCard({ title, badge, action, children }: SectionCardProps) {
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
            {/* Шапка секции */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                    {badge}
                </div>
                {action}
            </div>

            {/* Контент секции с разделителями между дочерними элементами */}
            <div className="flex-1 divide-y divide-border/40">
                {children}
            </div>
        </div>
    );
}

/**
 * Строка внутри SectionCard.
 * Используется для отображения отдельных элементов списка с эффектом наведения.
 */
export function SectionRow({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/30 transition-colors">
            {children}
        </div>
    );
}

/**
 * Заглушка для пустой секции.
 * Отображает центрированный текст при отсутствии данных.
 */
export function SectionEmpty({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            {label}
        </div>
    );
}
