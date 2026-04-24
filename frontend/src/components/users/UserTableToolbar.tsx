import { Search, ZapOff, ChevronDown } from "lucide-react";

import { Spinner } from "@/components/ui/Spinner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/DropDownMenu";
import { styles } from "@/styles";

const s = styles.userTableToolbar;

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
    <div className={s.root}>
      {/* Поле поиска */}
      <div className={s.searchWrap}>
        <Search size={16} className={s.searchIcon} />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по имени..."
          className={s.searchInput}
          aria-label="Поиск пользователей"
        />
      </div>

      {/* Выпадающий список фильтра по статусу */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={s.filterTrigger}
          aria-label="Фильтр по статусу"
        >
          {currentLabel}
          <ChevronDown size={14} className={s.filterChevron} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={s.filterContent}>
          <DropdownMenuGroup>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => onStatusFilterChange(option.value)}
                data-active={option.value === statusFilter}
                className={s.filterItemActive}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Правая часть: кнопка массового отключения и счетчик */}
      <div className={s.right}>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onKick}
            disabled={kickPending}
            className={s.kickButton}
            aria-label={`Отключить ${selectedCount} выбранных пользователей`}
          >
            {kickPending ? (
              <Spinner size="sm" className={s.kickSpinner} />
            ) : (
              <ZapOff size={16} />
            )}
            <span>Кикнуть {selectedCount}</span>
          </button>
        )}

        {/* Счетчик результатов */}
        <span className={s.counter}>
          {filtered === total
            ? `${total} пользователь${total === 1 ? "" : "ей"}`
            : `${filtered} из ${total}`}
        </span>
      </div>
    </div>
  );
}
