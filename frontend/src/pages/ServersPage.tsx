import { useState } from "react";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ServerTable } from "@/components/servers/ServerTable";
import { ServerCreateModal } from "@/components/servers/ServerCreateForm";
import { ServerEditModal } from "@/components/servers/ServerEditForm";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { ServerAdminResponse } from "@/api/types";

// -------------------------------------------------------------
// Страница управления серверами
// -------------------------------------------------------------

/**
 * Компонент `ServersPage` отображает страницу управления VPN-серверами.
 * Предоставляет интерфейс для просмотра, создания и редактирования серверов.
 */
export function ServersPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [editingServer, setEditingServer] = useState<ServerAdminResponse | null>(null);

    return (
        <AppShell>
            <div className="p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">

                {/* Шапка страницы */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            Серверы
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Управление серверами
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className={cn(
                            "inline-flex items-center gap-2 px-4 h-9 rounded-xl",
                            "bg-primary/10 text-primary border border-primary/20",
                            "hover:bg-primary/15 transition-colors text-sm font-medium",
                        )}
                    >
                        <Plus size={15} />
                        Добавить сервер
                    </button>
                </div>

                {/* Карточка с таблицей серверов */}
                <Card className="overflow-hidden">
                    <ServerTable onEdit={setEditingServer} />
                </Card>

            </div>

            {showCreate && <ServerCreateModal onClose={() => setShowCreate(false)} />}
            {editingServer && <ServerEditModal server={editingServer} onClose={() => setEditingServer(null)} />}
        </AppShell>
    );
}