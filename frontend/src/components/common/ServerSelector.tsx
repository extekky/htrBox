import { ServerOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";
import type { ServerPublicResponse } from "@/api/types";

const s = styles.serverSelector;

interface ServerSelectorProps {
  servers: ServerPublicResponse[];
  selectedServerId: string | null;
  onSelect: (server: ServerPublicResponse) => void;
}

export function ServerSelector({
  servers,
  selectedServerId,
  onSelect,
}: ServerSelectorProps) {
  if (servers.length === 0) {
    return (
      <div className={s.empty}>
        <div className={s.emptyIcon}>
          <ServerOff size={18} />
        </div>
        <div>
          <p className={s.emptyTitle}>Нет доступных серверов</p>
          <p className={s.emptyHint}>
            Активные серверы временно недоступны!!!!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.list} role="radiogroup" aria-label="Выбор сервера">
      {servers.map((server) => {
        const isSelected = server.id === selectedServerId;

        return (
          <button
            key={server.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(server)}
            className={cn(s.item, isSelected ? s.itemSelected : s.itemDefault)}
          >
            {/* Radio indicator */}
            <div
              className={cn(
                s.radio,
                isSelected ? s.radioSelected : s.radioDefault,
              )}
            >
              {isSelected && <div className={s.radioDot} />}
            </div>

            {/* Location */}
            <div className={s.itemBody}>
              <p
                className={isSelected ? s.itemNameSelected : s.itemNameDefault}
              >
                {server.country}
              </p>
              <p className={s.itemCity}>{server.city}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
