import { Pencil, Trash2 } from "lucide-react";

import { Checkbox } from "@/components/ui/CheckBox";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { pickAvatar } from "@/lib/avatars";

import {
    toGB,
    formatDate,
    formatDaysLeft,
    getExpiryTier,
} from "@/lib/formatters";

import { DEFAULT_TRAFFIC_LIMIT_GB } from "@/lib/constants";
import { cn } from "@/lib/cn";

import type { UserResponse } from "@/api/types";

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface UserRowProps {
    user: UserResponse;
    selected: boolean;
    onToggleSelect: (username: string) => void;
    onEdit: (user: UserResponse) => void;
    onDelete: (username: string) => void;
}

// -------------------------------------------------------------
// Вспомогательный компонент — аватар с инициалами
// -------------------------------------------------------------

function InitialsAvatar({ name }: { name: string }) {
    const initials = name.slice(0, 2).toUpperCase();
    return (
        <div
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[11px] font-semibold select-none"
        >
            {initials}
        </div>
    );
}

// -------------------------------------------------------------
// Компонент строки пользователя
// -------------------------------------------------------------

/**
 * Отображает одну строку в таблице пользователей.
 *
 * - Выводит аватар с инициалами и имя пользователя.
 * - Показывает прогресс-бар использования трафика.
 * - Информирует о сроке действия подписки с цветовой индикацией.
 * - Предоставляет кнопки редактирования и удаления.
 */
export function UserRow({
    user,
    selected,
    onToggleSelect,
    onEdit,
    onDelete,
}: UserRowProps) {
    const usedGb = toGB(user.usedTraffic);
    const trafficPercentage = Math.min(100, (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100);
    const expiryTier = user.expires_at ? getExpiryTier(user.expires_at) : null;

    return (
        <tr
            className={cn(
                "group transition-colors duration-100",
                selected ? "bg-primary/5" : "hover:bg-muted/40",
            )}
        >
            {/* Колонка с чекбоксом выбора */}
            <td className="pl-4 pr-2 py-3.5 w-10">
                <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleSelect(user.username)}
                    aria-label={`Выбрать пользователя ${user.username}`}
                />
            </td>

            {/* Имя пользователя и аватар */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                    {/* <InitialsAvatar name={user.username} /> */}
                    {(() => {
                        const Avatar = pickAvatar(user.username);
                        return (
                            <div className="w-7 h-7 shrink-0 overflow-hidden relative">
                                <div className="absolute scale-50 origin-top-left">
                                    <Avatar />
                                </div>
                            </div>
                        );
                    })()}
                    <span className="text-sm font-medium text-foreground truncate max-w-45">
                        {user.username}
                    </span>
                </div>
            </td>

            {/* Использование трафика */}
            <td className="px-4 py-3.5">
                <div className="flex flex-col gap-1.5 min-w-30">
                    <span className="text-xs font-medium text-foreground tabular-nums">
                        {usedGb.toFixed(2)} / {DEFAULT_TRAFFIC_LIMIT_GB} GB
                    </span>
                    <ProgressBar value={trafficPercentage} variant="traffic" />
                </div>
            </td>

            {/* Бейджи статуса */}
            <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1.5">
                    <StatusBadge type="allowed" value={user.allowed} />
                    <StatusBadge type="active" value={user.active} />
                </div>
            </td>

            {/* Информация об истечении */}
            <td className="px-4 py-3.5">
                {user.expires_at ? (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-foreground tabular-nums">
                            {formatDate(user.expires_at)}
                        </span>
                        <span
                            className={cn(
                                "text-xs font-medium",
                                expiryTier === "expired" || expiryTier === "critical"
                                    ? "text-destructive"
                                    : expiryTier === "warning"
                                        ? "text-amber-500"
                                        : "text-muted-foreground",
                            )}
                        >
                            {formatDaysLeft(user.expires_at)}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">Нет даты</span>
                )}
            </td>

            {/* Кнопки действий */}
            <td className="px-4 pr-5 py-3.5">
                <div className="flex items-center justify-end gap-0.5">
                    <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className={cn(
                            "h-8 w-8 flex items-center justify-center rounded-md",
                            "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                            // "opacity-0 group-hover:opacity-100",
                        )}
                        aria-label={`Редактировать пользователя ${user.username}`}
                        title="Редактировать"
                    >
                        <Pencil size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(user.username)}
                        className={cn(
                            "h-8 w-8 flex items-center justify-center rounded-md",
                            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                            // "opacity-0 group-hover:opacity-100",
                        )}
                        aria-label={`Удалить пользователя ${user.username}`}
                        title="Удалить"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}