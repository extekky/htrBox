import { Pencil, Trash2, MapPin, Globe } from "lucide-react";
import { useUpdateServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { ServerAdminResponse } from "@/api/types";

// -------------------------------------------------------------
// Переключатель активности сервера
// Мгновенно отправляет PATCH-запрос при изменении состояния.
// -------------------------------------------------------------

function ActiveToggle({ server }: { server: ServerAdminResponse }) {
  const { mutate: updateServer, isPending } = useUpdateServer();
  const { error } = useToast();

  function toggle() {
    updateServer(
      { id: server.id, data: { active: !server.active } },
      { onError: (e) => error("Ошибка обновления сервера", e.message) },
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      role="switch"
      aria-checked={server.active}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        server.active ? "bg-emerald-500" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow",
          "transition-transform duration-200 ease-in-out",
          server.active ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface ServerRowProps {
  server: ServerAdminResponse;
  onEdit: (server: ServerAdminResponse) => void;
  onDelete: (server: ServerAdminResponse) => void;
}

// -------------------------------------------------------------
// Компонент строки таблицы серверов
// -------------------------------------------------------------

/**
 * Отображает одну строку в таблице серверов.
 *
 * - Выводит местоположение с иконкой, адрес, протокол, дату обновления.
 * - Inline-переключатель активности.
 * - Кнопки редактирования и удаления появляются при наведении на строку.
 */
export function ServerRow({ server, onEdit, onDelete }: ServerRowProps) {
  const host = server.domain ?? server.ip;

  return (
    <tr className="group transition-colors duration-100 hover:bg-muted/40">
      {/* Местоположение с иконкой */}
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0 mt-0.5">
            <MapPin size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {server.label || "Без названия"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {server.country} · {server.city}
            </p>
          </div>
        </div>
      </td>

      {/* IP : порт */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Globe size={13} className="text-muted-foreground shrink-0" />
          <code className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-mono text-foreground tabular-nums">
            {host}:{server.port}
          </code>
        </div>
      </td>

      {/* Протокол */}
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {server.protocol}
        </span>
      </td>

      {/* Дата обновления */}
      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
        {formatDateTime(server.updated_at)}
      </td>

      {/* Переключатель активности */}
      <td className="px-4 py-3.5">
        <ActiveToggle server={server} />
      </td>

      {/* Кнопки действий */}
      <td className="px-4 pr-5 py-3.5">
        <div className="flex items-center justify-end gap-0.5">
          <button
            onClick={() => onEdit(server)}
            title="Редактировать"
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md",
              "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              // "opacity-0 group-hover:opacity-100",
            )}
            aria-label={`Редактировать сервер ${server.label || server.city}`}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(server)}
            title="Удалить"
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              // "opacity-0 group-hover:opacity-100",
            )}
            aria-label={`Удалить сервер ${server.label || server.city}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
