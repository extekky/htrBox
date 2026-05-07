import { useState } from "react";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ServerTable } from "@/components/servers/ServerTable";
import { ServerCreateModal } from "@/components/servers/ServerCreateForm";
import { ServerEditModal } from "@/components/servers/ServerEditForm";
import { Card } from "@/components/ui/Card";
import type { ServerAdminResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.serversPage;

// -------------------------------------------------------------
// Страница управления серверами
// -------------------------------------------------------------

/**
 * Компонент `ServersPage` отображает страницу управления VPN-серверами.
 * Предоставляет интерфейс для просмотра, создания и редактирования серверов.
 */
export function ServersPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingServer, setEditingServer] =
    useState<ServerAdminResponse | null>(null);

  return (
    <AppShell>
      <div className={s.root}>
        {/* Шапка страницы */}
        <div className={s.header}>
          <div>
            <h1 className={s.title}>Серверы</h1>
            <p className={s.subtitle}>Управление серверами</p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className={s.createButton}
          >
            <Plus size={15} />
            Добавить сервер
          </button>
        </div>

        {/* Карточка с таблицей серверов */}
        <Card className={s.tableCard}>
          <ServerTable onEdit={setEditingServer} />
        </Card>
      </div>

      {showCreate && <ServerCreateModal onClose={() => setShowCreate(false)} />}
      {editingServer && (
        <ServerEditModal
          server={editingServer}
          onClose={() => setEditingServer(null)}
        />
      )}
    </AppShell>
  );
}
