import { useState, useMemo } from "react";
import { Users } from "lucide-react";

import { Checkbox } from "@/components/ui/CheckBox";
import { CardContent } from "@/components/ui/Card";
import { UserTableToolbar, type StatusFilter } from "./UserTableToolbar";
import { UserRow } from "./UserRow";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { useUsers, useDeleteUser, useKickUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";

import { daysUntil } from "@/lib/formatters";
import { cn } from "@/lib/cn";

import type { UserResponse } from "@/api/types";

// -------------------------------------------------------------
// Вспомогательные компоненты
// -------------------------------------------------------------

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
    return (
        <th
            className={cn(
                "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                className,
            )}
        >
            {children}
        </th>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="pl-4 pr-2 py-4 w-10">
                <div className="w-4 h-4 rounded bg-muted" />
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-muted shrink-0" />
                    <div className="h-4 w-36 rounded bg-muted" />
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-2 w-32 rounded bg-muted" />
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="flex gap-1.5">
                    <div className="h-5 w-16 rounded-full bg-muted" />
                    <div className="h-5 w-16 rounded-full bg-muted" />
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="h-4 w-20 rounded bg-muted" />
            </td>
            <td className="px-4 py-4" />
        </tr>
    );
}

function EmptyState({ search, statusFilter }: { search: string; statusFilter: StatusFilter }) {
    const isFiltered = search !== "" || statusFilter !== "all";
    return (
        <tr>
            <td colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted/50">
                        <Users size={28} className="text-muted-foreground/60" />
                    </div>
                    <div>
                        <p className="text-base font-medium text-foreground">
                            {isFiltered ? "Нет совпадений" : "Нет пользователей"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
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
function matchesFilter(user: UserResponse, filter: StatusFilter, search: string): boolean {
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
    const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(new Set());

    // Состояние диалогов подтверждения
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [showKickConfirm, setShowKickConfirm] = useState(false);

    // Отфильтрованный список пользователей (мемоизирован)
    const filteredUsers = useMemo(
        () => users.filter((user) => matchesFilter(user, statusFilter, search)),
        [users, statusFilter, search],
    );

    const allSelected = filteredUsers.length > 0 && selectedUsernames.size === filteredUsers.length;

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
                const message = err instanceof Error ? err.message : "Неизвестная ошибка";
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
                onEdit={onEdit}
                onDelete={(username) => setDeleteTarget(username)}
            />
        ));
    }

    return (
        <div className="flex flex-col animate-fade-in">

            {/* Панель инструментов */}
            <CardContent className="p-4 border-b border-border/60">
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
            <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                    <thead className="border-b border-border/60 bg-muted/30 sticky top-0 z-10">
                        <tr>
                            <th className="pl-4 pr-2 py-3.5 w-10">
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
                            <Th className="text-right pr-5">Действия</Th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {renderBody()}
                    </tbody>
                </table>
            </div>

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