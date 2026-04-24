import { useState, useMemo } from "react";
import { Users } from "lucide-react";

import { Checkbox } from "@/components/ui/CheckBox";
import { CardContent } from "@/components/ui/Card";
import { UserTableToolbar, type StatusFilter } from "./UserTableToolbar";
import { UserRow } from "./UserRow";
import { UserViewModal } from "./UserViewModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { useUsers, useDeleteUser, useKickUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";

import { daysUntil } from "@/lib/formatters";
import { cn } from "@/lib/cn";

import type { UserResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.userTable;

// -------------------------------------------------------------
// Вспомогательные компоненты
// -------------------------------------------------------------

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <th className={cn(s.th, className)}>{children}</th>;
}

function SkeletonRow() {
  return (
    <tr className={s.skeletonRow}>
      <td className={s.skeletonTdCheck}>
        <div className={s.skeletonCheck} />
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonUserWrap}>
          <div className={s.skeletonAvatar} />
          <div className={s.skeletonName} />
        </div>
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonTrafficWrap}>
          <div className={s.skeletonTrafficText} />
          <div className={s.skeletonTrafficBar} />
        </div>
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonStatusWrap}>
          <div className={s.skeletonStatus} />
          <div className={s.skeletonStatus} />
        </div>
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonDate} />
      </td>
      <td className={s.skeletonTd} />
    </tr>
  );
}

function EmptyState({
  search,
  statusFilter,
}: {
  search: string;
  statusFilter: StatusFilter;
}) {
  const isFiltered = search !== "" || statusFilter !== "all";
  return (
    <tr>
      <td colSpan={6}>
        <div className={s.emptyWrap}>
          <div className={s.emptyIconWrap}>
            <Users size={28} className={s.emptyIcon} />
          </div>
          <div>
            <p className={s.emptyTitle}>
              {isFiltered ? "Нет совпадений" : "Нет пользователей"}
            </p>
            <p className={s.emptyHint}>
              {isFiltered
                ? "Измените запрос или фильтр"
                : "Создайте первого пользователя"}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// -------------------------------------------------------------
// Вспомогательные функции
// -------------------------------------------------------------

/**
 * Проверяет, соответствует ли пользователь заданному фильтру и поисковому запросу.
 */
function matchesFilter(
  user: UserResponse,
  filter: StatusFilter,
  search: string,
): boolean {
  const searchLower = search.toLowerCase();
  if (search && !user.username.toLowerCase().includes(searchLower)) {
    return false;
  }

  switch (filter) {
    case "active":
      return user.active && user.allowed;
    case "blocked":
      return !user.allowed;
    case "inactive":
      return !user.active;
    case "expiring": {
      const days = daysUntil(user.expires_at);
      return days !== null && days >= 0 && days <= 7;
    }
    default:
      return true;
  }
}

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface UserTableProps {
  onEdit: (user: UserResponse) => void;
}

// -------------------------------------------------------------
// Основной компонент
// -------------------------------------------------------------

/**
 * Таблица управления пользователями.
 *
 * - Всегда отображает заголовки колонок (в том числе при пустом списке).
 * - Показывает скелетон во время загрузки.
 * - Поддерживает одиночный и массовый выбор через чекбоксы.
 * - Позволяет редактировать, удалять и кикать пользователей.
 */
export function UserTable({ onEdit }: UserTableProps) {
  // Данные и API-мутации
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const kickUsers = useKickUsers();
  const { success, error } = useToast();

  // Состояние фильтрации и поиска
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Состояние выбора пользователей
  const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(
    new Set(),
  );

  // Состояние диалогов подтверждения
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewTarget, setViewTarget] = useState<UserResponse | null>(null);
  const [showKickConfirm, setShowKickConfirm] = useState(false);

  // Отфильтрованный список пользователей (мемоизирован)
  const filteredUsers = useMemo(
    () => users.filter((user) => matchesFilter(user, statusFilter, search)),
    [users, statusFilter, search],
  );

  const allSelected =
    filteredUsers.length > 0 && selectedUsernames.size === filteredUsers.length;

  // -------------------------------------------------------------
  // Обработчики выбора
  // -------------------------------------------------------------

  const toggleSelection = (username: string) => {
    setSelectedUsernames((prev) => {
      const next = new Set(prev);
      next.has(username) ? next.delete(username) : next.add(username);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedUsernames(
      allSelected ? new Set() : new Set(filteredUsers.map((u) => u.username)),
    );
  };

  // -------------------------------------------------------------
  // Обработчики действий
  // -------------------------------------------------------------

  /** Удаление одного пользователя. */
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  /** Массовое отключение (кик) выбранных пользователей. */
  const handleKickConfirm = () => {
    const usernames = Array.from(selectedUsernames);
    if (usernames.length === 0) return;

    kickUsers.mutate(usernames, {
      onSuccess: () => {
        success(`Отключено ${usernames.length} пользователей`);
        setShowKickConfirm(false);
        setSelectedUsernames(new Set());
      },
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Неизвестная ошибка";
        error("Ошибка отключения пользователей", message);
        setShowKickConfirm(false);
      },
    });
  };

  function renderBody() {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />);
    }
    if (filteredUsers.length === 0) {
      return <EmptyState search={search} statusFilter={statusFilter} />;
    }
    return filteredUsers.map((user) => (
      <UserRow
        key={user.username}
        user={user}
        selected={selectedUsernames.has(user.username)}
        onToggleSelect={toggleSelection}
        onView={(user) => setViewTarget(user)}
        onEdit={onEdit}
        onDelete={(username) => setDeleteTarget(username)}
      />
    ));
  }

  return (
    <div className={s.root}>
      {/* Панель инструментов */}
      <CardContent className={s.toolbar}>
        <UserTableToolbar
          total={users.length}
          filtered={filteredUsers.length}
          selectedCount={selectedUsernames.size}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onKick={() => setShowKickConfirm(true)}
          kickPending={kickUsers.isPending}
        />
      </CardContent>

      {/* Таблица — всегда рендерится, включая заголовки */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead className={s.head}>
            <tr>
              <th className={s.thCheck}>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Выбрать всех пользователей"
                />
              </th>
              <Th>Пользователь</Th>
              <Th>Трафик</Th>
              <Th>Статус</Th>
              <Th>Истекает</Th>
              <Th className={s.thActions}>Действия</Th>
            </tr>
          </thead>
          <tbody className={s.body}>{renderBody()}</tbody>
        </table>
      </div>

      {viewTarget && (
        <UserViewModal user={viewTarget} onClose={() => setViewTarget(null)} />
      )}

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить пользователя?"
        description={
          deleteTarget
            ? `Пользователь «${deleteTarget}» и все связанные данные будут удалены без возможности восстановления.`
            : ""
        }
        confirmLabel="Удалить"
        variant="destructive"
        loading={deleteUser.isPending}
      />

      {/* Диалог подтверждения массового отключения */}
      <ConfirmDialog
        open={showKickConfirm}
        onClose={() => setShowKickConfirm(false)}
        onConfirm={handleKickConfirm}
        title={`Отключить ${selectedUsernames.size} пользовател${selectedUsernames.size === 1 ? "я" : "ей"}?`}
        description="Выбранные пользователи будут заблокированы и немедленно отключены от VPN-сервера."
        confirmLabel="Отключить"
        variant="destructive"
        loading={kickUsers.isPending}
      />
    </div>
  );
}
