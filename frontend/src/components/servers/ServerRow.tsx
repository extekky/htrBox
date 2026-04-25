import { Pencil, Trash2, MapPin, Globe } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { ServerAdminResponse } from "@/api/types";
import { ActiveToggle } from "@/components/ui/ActiveToggle";
import { styles } from "@/styles";

const s = styles.serverRow;

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
    <tr className={s.root}>
      {/* Местоположение с иконкой */}
      <td className={s.tdCell}>
        <div className={s.locationWrap}>
          <div className={s.locationIconWrap}>
            <MapPin size={14} className={s.locationIcon} />
          </div>
          <div>
            <p className={s.locationTitle}>{server.label || "Без названия"}</p>
            <p className={s.locationMeta}>
              {server.country} · {server.city}
            </p>
          </div>
        </div>
      </td>

      {/* IP : порт */}
      <td className={s.tdCell}>
        <div className={s.hostWrap}>
          <Globe size={13} className={s.hostIcon} />
          <code className={s.hostCode}>
            {host}:{server.port}
          </code>
        </div>
      </td>

      {/* Протокол */}
      <td className={s.tdCell}>
        <span className={s.protocolBadge}>{server.protocol}</span>
      </td>

      {/* Дата обновления */}
      <td className={cn(s.tdCell, s.updatedAt)}>
        {formatDateTime(server.updated_at)}
      </td>

      {/* Переключатель активности */}
      <td className={s.tdCenter}>
        <div className={s.cellInlineCenter}>
          <ActiveToggle server={server} />
        </div>
      </td>

      {/* Кнопки действий */}
      <td className={s.tdActions}>
        <div className={s.actionsWrap}>
          <button
            onClick={() => onEdit(server)}
            title="Редактировать"
            className={cn(s.actionButton, s.actionEdit)}
            aria-label={`Редактировать сервер ${server.label || server.city}`}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(server)}
            title="Удалить"
            className={cn(s.actionButton, s.actionDelete)}
            aria-label={`Удалить сервер ${server.label || server.city}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
