import { cn } from "@/lib/cn";
import {
  USER_STATUS_OPTIONS,
  getUserStatusDefinition,
} from "@/lib/userStatuses";
import type { UserStatusKey } from "@/api/types";
import { styles } from "@/styles";

const s = styles.userStatusPicker;

const STATUS_PICKER_HINTS: Record<UserStatusKey, string> = {
  friend: "Пометка для друзей проекта",
  paid: "Платный пользователь с активной подпиской",
  school: "Статус для школьников с бесплатным доступом",
  trial: "Пометка для пользователей в пробном периоде",
};

interface UserStatusPickerProps {
  statuses: UserStatusKey[];
  onToggle: (status: UserStatusKey) => void;
}

export function UserStatusPicker({
  statuses,
  onToggle,
}: UserStatusPickerProps) {
  return (
    <div className={s.root}>
      <div className={s.header}>
        <p className={s.title}>Статусы пользователя</p>
        <p className={s.hint}>
          Роль администратора подтягивается автоматически.
        </p>
      </div>

      <div className={s.grid}>
        {USER_STATUS_OPTIONS.map((statusKey) => {
          const selected = statuses.includes(statusKey);
          const status = getUserStatusDefinition(statusKey);
          const Icon = status.Icon;

          return (
            <button
              key={statusKey}
              type="button"
              onClick={() => onToggle(statusKey)}
              className={cn(
                s.optionBase,
                selected ? cn(s.optionSelected, status.tone) : s.optionDefault,
              )}
            >
              <Icon className={s.optionIcon} />
              <div>
                <p className={s.optionLabel}>{status.label}</p>
                <p className={s.optionMeta}>{STATUS_PICKER_HINTS[statusKey]}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
