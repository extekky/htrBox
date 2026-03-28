import { useState } from "react";
import { Server } from "lucide-react";
import { ServerRow } from "./ServerRow";
import { CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useServersAdmin, useDeleteServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/cn";
import type { ServerAdminResponse } from "@/api/types";

// -------------------------------------------------------------
// Вспомогательные компоненты
// -------------------------------------------------------------

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
    return (
        <th
            className={cn(
                "px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide",
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
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                    <div className="h-4 w-32 rounded bg-muted" />
                </div>
            </td>
            <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-muted" /></td>
            <td className="px-4 py-4"><div className="h-5 w-20 rounded-full bg-muted" /></td>
            <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-muted" /></td>
            <td className="px-4 py-4"><div className="h-5 w-16 rounded-full bg-muted" /></td>
            <td className="px-4 py-4" />
        </tr>
    );
}

function EmptyState({ filtered }: { filtered: boolean }) {
    return (
        <tr>
            <td colSpan={6}>
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted/50">
                        <Server size={28} className="text-muted-foreground/60" />
                    </div>
                    <div>
                        <p className="text-base font-medium text-foreground">
                            {filtered ? "Нет совпадений" : "Нет серверов"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {filtered
                                ? "Измените поисковый запрос"
                                : "Добавьте первый VPN-сервер"}
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    );
}

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface ServerTableProps {
    /** Функция обратного вызова при редактировании сервера. */
    onEdit: (server: ServerAdminResponse) => void;
}

// -------------------------------------------------------------
// Основной компонент
// -------------------------------------------------------------

/**
 * Таблица управления VPN-серверами.
 *
 * - Всегда отображает заголовки колонок (в том числе при пустом списке).
 * - Показывает скелетон во время загрузки.
 * - Позволяет редактировать и удалять серверы.
 * - Включает диалог подтверждения для удаления.
 */
export function ServerTable({ onEdit }: ServerTableProps) {
    const { data: servers = [], isLoading } = useServersAdmin();
    const { mutate: deleteServer, isPending: deletePending } = useDeleteServer();
    const { success, error } = useToast();

    const [deleteTarget, setDeleteTarget] = useState<ServerAdminResponse | null>(null);
    const search: string = ""; // поиск пока не реализован

    const filteredServers = servers.filter(
        (server) =>
            search === "" ||
            server.label?.toLowerCase().includes(search.toLowerCase()) ||
            server.city?.toLowerCase().includes(search.toLowerCase()) ||
            server.country?.toLowerCase().includes(search.toLowerCase()) ||
            server.ip?.includes(search) ||
            server.domain?.includes(search),
    );

    const isFiltered = search !== "" && filteredServers.length < servers.length;

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        deleteServer(deleteTarget.id, {
            onSuccess: () => {
                success("Сервер удалён", deleteTarget.label || deleteTarget.city);
                setDeleteTarget(null);
            },
            onError: (e) => {
                error("Ошибка удаления сервера", e.message);
                setDeleteTarget(null);
            },
        });
    }

    function renderCounter() {
        if (isLoading) return "Загрузка…";
        if (isFiltered) return `${filteredServers.length} из ${servers.length}`;
        return `${servers.length} сервер${servers.length === 1 ? "" : "ов"}`;
    }

    function renderBody() {
        if (isLoading) {
            return Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />);
        }
        if (filteredServers.length === 0) {
            return <EmptyState filtered={isFiltered} />;
        }
        return filteredServers.map((server) => (
            <ServerRow
                key={server.id}
                server={server}
                onEdit={onEdit}
                onDelete={setDeleteTarget}
            />
        ));
    }

    return (
        <div className="flex flex-col animate-fade-in">

            {/* Шапка с заголовком и счётчиком */}
            <CardContent className="p-4 border-b border-border/60">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">VPN-серверы</span>
                    <span className="text-sm text-muted-foreground">{renderCounter()}</span>
                </div>
            </CardContent>

            {/* Таблица — всегда рендерится, включая заголовки */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                    <thead className="border-b border-border/60 bg-muted/30 sticky top-0 z-10">
                        <tr>
                            <Th>Сервер</Th>
                            <Th>Адрес</Th>
                            <Th>Протокол</Th>
                            <Th>Обновлён</Th>
                            <Th>Активен</Th>
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
                title="Удалить сервер?"
                description={
                    deleteTarget
                        ? `Сервер «${deleteTarget.label || deleteTarget.city} (${deleteTarget.ip})» будет удалён безвозвратно.`
                        : undefined
                }
                confirmLabel="Удалить"
                variant="destructive"
                loading={deletePending}
            />
        </div>
    );
}