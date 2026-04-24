import { useUpdateServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/cn";
import type { ServerAdminResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.activeToggle;

// -------------------------------------------------------------
// Переключатель активности сервера
// Мгновенно отправляет PATCH-запрос при изменении состояния.
// -------------------------------------------------------------

interface ActiveToggleProps {
  server: ServerAdminResponse;
}

export function ActiveToggle({ server }: ActiveToggleProps) {
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
      className={cn(s.root, server.active ? s.on : s.off)}
    >
      <span
        className={cn(
          s.thumb,
          server.active ? s.thumbOn : s.thumbOff,
        )}
      />
    </button>
  );
}
