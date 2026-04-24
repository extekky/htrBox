import { useState } from "react";
import { Server } from "lucide-react";
import { ServerRow } from "./ServerRow";
import { CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useServersAdmin, useDeleteServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/cn";
import type { ServerAdminResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.serverTable;

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
      <td className={s.skeletonTd}>
        <div className={s.skeletonServerWrap}>
          <div className={s.skeletonServerIcon} />
          <div className={s.skeletonServerText} />
        </div>
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonAddr} />
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonProtocol} />
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonUpdated} />
      </td>
      <td className={s.skeletonTd}>
        <div className={s.skeletonActive} />
      </td>
      <td className={s.skeletonTd} />
    </tr>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <tr>
      <td colSpan={6}>
        <div className={s.emptyWrap}>
          <div className={s.emptyIconWrap}>
            <Server size={28} className={s.emptyIcon} />
          </div>
          <div>
            <p className={s.emptyTitle}>
              {filtered ? "Нет совпадений" : "Нет серверов"}
            </p>
            <p className={s.emptyHint}>
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

  const [deleteTarget, setDeleteTarget] = useState<ServerAdminResponse | null>(
    null,
  );
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
    <div className={s.root}>
      {/* Шапка с заголовком и счётчиком */}
      <CardContent className={s.headCard}>
        <div className={s.headInner}>
          <span className={s.title}>VPN-серверы</span>
          <span className={s.counter}>{renderCounter()}</span>
        </div>
      </CardContent>

      {/* Таблица — всегда рендерится, включая заголовки */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead className={s.thead}>
            <tr>
              <Th>Сервер</Th>
              <Th>Адрес</Th>
              <Th>Протокол</Th>
              <Th>Обновлён</Th>
              <Th>Активен</Th>
              <Th className={s.thActions}>Действия</Th>
            </tr>
          </thead>
          <tbody className={s.tbody}>{renderBody()}</tbody>
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
