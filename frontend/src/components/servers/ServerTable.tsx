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
// Вспомогательный компонент заголовка таблицы
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

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface ServerTableProps {
    /** Функция обратного вызова при редактировании сервера. */
    onEdit: (server: ServerAdminResponse) => void;
}

// -------------------------------------------------------------
// Компонент таблицы серверов
// -------------------------------------------------------------

/**
 * Таблица управления VPN-серверами.
 *
 * - Отображает список серверов с поиском.
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

    return (
        <div className="flex flex-col animate-fade-in">

            {/* Шапка таблицы с счётчиком */}
            <CardContent className="p-4 border-b border-border/60">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                        VPN-серверы
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {isLoading
                            ? "Загрузка…"
                            : filteredServers.length === servers.length
                                ? `${servers.length} сервер${servers.length === 1 ? "" : "ов"}`
                                : `${filteredServers.length} из ${servers.length}`}
                    </span>
                </div>
            </CardContent>

            {/* Контент */}
            {isLoading ? (
                <div className="divide-y divide-border/40">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="px-4 py-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                                <div className="h-4 w-32 rounded bg-muted" />
                                <div className="h-6 w-36 rounded-md bg-muted ml-6" />
                                <div className="h-5 w-16 rounded-full bg-muted ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : servers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted/50">
                        <Server size={28} className="text-muted-foreground/60" />
                    </div>
                    <div>
                        <p className="text-base font-medium text-foreground">Нет серверов</p>
                        <p className="text-sm text-muted-foreground mt-1">Добавьте первый VPN-сервер</p>
                    </div>
                </div>
            ) : filteredServers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted/50">
                        <Server size={28} className="text-muted-foreground/60" />
                    </div>
                    <div>
                        <p className="text-base font-medium text-foreground">Нет совпадений</p>
                        <p className="text-sm text-muted-foreground mt-1">Измените поисковый запрос</p>
                    </div>
                </div>
            ) : (
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
                            {filteredServers.map((server) => (
                                <ServerRow
                                    key={server.id}
                                    server={server}
                                    onEdit={onEdit}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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