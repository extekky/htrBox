import { Search, ZapOff, ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/DropDownMenu";

// -------------------------------------------------------------
// Типы и константы фильтрации
// -------------------------------------------------------------

export type StatusFilter =
  | "all"
  | "active"
  | "blocked"
  | "inactive"
  | "expiring";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "blocked", label: "Заблокированные" },
  { value: "inactive", label: "Неактивные" },
  { value: "expiring", label: "Истекают ≤7 дней" },
];

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface UserTableToolbarProps {
  total: number;
  filtered: number;
  selectedCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  onKick: () => void;
  kickPending: boolean;
}

// -------------------------------------------------------------
// Компонент панели инструментов таблицы пользователей
// -------------------------------------------------------------

/**
 * Панель инструментов для управления списком пользователей.
 *
 * - Поиск по имени в реальном времени.
 * - Фильтрация по статусу (активные, заблокированные и т.д.).
 * - Массовые действия (отключение выбранных пользователей).
 * - Отображение счетчика результатов.
 */
export function UserTableToolbar({
  total,
  filtered,
  selectedCount,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onKick,
  kickPending,
}: UserTableToolbarProps) {
  const currentLabel =
    STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "Все";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
      {/* Поле поиска */}
      <div className="relative flex-1 sm:max-w-70">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по имени..."
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-card px-10 py-2.5",
            "text-sm text-foreground placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
            "transition-all duration-150",
          )}
          aria-label="Поиск пользователей"
        />
      </div>

      {/* Выпадающий список фильтра по статусу */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex items-center justify-between gap-2",
            "h-10 min-w-40 rounded-lg border border-border bg-card px-3.5 py-2.5",
            "text-sm text-foreground cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
            "transition-all duration-150",
          )}
          aria-label="Фильтр по статусу"
        >
          {currentLabel}
          <ChevronDown size={14} className="opacity-50 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40">
          <DropdownMenuGroup>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => onStatusFilterChange(option.value)}
                data-active={option.value === statusFilter}
                className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Правая часть: кнопка массового отключения и счетчик */}
      <div className="flex items-center gap-3 sm:ml-auto">
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onKick}
            disabled={kickPending}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-4 rounded-lg",
              "text-sm font-medium bg-destructive text-destructive-foreground",
              "hover:bg-destructive/90 focus:bg-destructive/90",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            )}
            aria-label={`Отключить ${selectedCount} выбранных пользователей`}
          >
            {kickPending ? (
              <Spinner size="sm" className="text-destructive-foreground" />
            ) : (
              <ZapOff size={16} />
            )}
            <span>Кикнуть {selectedCount}</span>
          </button>
        )}

        {/* Счетчик результатов */}
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered === total
            ? `${total} пользователь${total === 1 ? "" : "ей"}`
            : `${filtered} из ${total}`}
        </span>
      </div>
    </div>
  );
}
