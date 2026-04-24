import { Pencil, Trash2, CheckCircle2 } from "lucide-react";

import { Checkbox } from "@/components/ui/CheckBox";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { pickAvatar } from "@/lib/avatars";

import {
  toGB,
  formatDate,
  formatDaysLeft,
  getExpiryTier,
} from "@/lib/formatters";

import { DEFAULT_TRAFFIC_LIMIT_GB } from "@/lib/constants";
import { cn } from "@/lib/cn";

import type { UserResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.userRow;

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface UserRowProps {
  user: UserResponse;
  selected: boolean;
  onToggleSelect: (username: string) => void;
  onView: (user: UserResponse) => void;
  onEdit: (user: UserResponse) => void;
  onDelete: (username: string) => void;
}

// -------------------------------------------------------------
// Вспомогательный компонент — аватар с инициалами
// -------------------------------------------------------------

function InitialsAvatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div aria-hidden className={s.initialsAvatar}>
      {initials}
    </div>
  );
}

// -------------------------------------------------------------
// Компонент строки пользователя
// -------------------------------------------------------------

/**
 * Отображает одну строку в таблице пользователей.
 *
 * - Выводит аватар с инициалами и имя пользователя.
 * - Показывает прогресс-бар использования трафика.
 * - Информирует о сроке действия подписки с цветовой индикацией.
 * - Предоставляет кнопки редактирования и удаления.
 */
export function UserRow({
  user,
  selected,
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
}: UserRowProps) {
  const usedGb = toGB(user.usedTraffic);
  const trafficPercentage = Math.min(
    100,
    (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100,
  );
  const expiryTier = user.expires_at ? getExpiryTier(user.expires_at) : null;

  return (
    <tr
      className={cn(s.root, selected ? s.rootSelected : s.rootDefault)}
      onClick={() => onView(user)}
    >
      {/* Колонка с чекбоксом выбора */}
      <td className={s.tdCheck} onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(user.username)}
          aria-label={`Выбрать пользователя ${user.username}`}
        />
      </td>

      {/* Имя пользователя и аватар */}
      <td className={s.tdCell}>
        <div className={s.userWrap}>
          {/* <InitialsAvatar name={user.username} /> */}
          {(() => {
            const Avatar = pickAvatar(user.username);
            return (
              <div className={s.avatarWrap}>
                <div className={s.avatarInner}>
                  <Avatar />
                </div>
              </div>
            );
          })()}
          <span className={s.username}>{user.username}</span>
        </div>
      </td>

      {/* Использование трафика */}
      <td className={s.tdCell}>
        <div className={s.trafficWrap}>
          <span className={s.trafficText}>
            {usedGb.toFixed(2)} / {DEFAULT_TRAFFIC_LIMIT_GB} GB
          </span>
          <ProgressBar value={trafficPercentage} variant="traffic" />
        </div>
      </td>

      {/* Бейджи статуса */}
      <td className={s.tdCell}>
        <div className={s.statusWrap}>
          <StatusBadge type="allowed" value={user.allowed} />
          <StatusBadge type="active" value={user.active} />
          {user.role === "admin" && <CheckCircle2 size={20} className={s.adminIcon} />}
        </div>
      </td>

      {/* Информация об истечении */}
      <td className={s.tdCell}>
        {user.expires_at ? (
          <div className={s.expiryWrap}>
            <span className={s.expiryDate}>{formatDate(user.expires_at)}</span>
            <span
              className={cn(
                expiryTier === "expired" || expiryTier === "critical"
                  ? s.expiryToneDanger
                  : expiryTier === "warning"
                    ? s.expiryToneWarning
                    : s.expiryToneDefault,
              )}
            >
              {formatDaysLeft(user.expires_at)}
            </span>
          </div>
        ) : (
          <span className={s.expiryNoDate}>Нет даты</span>
        )}
      </td>

      {/* Кнопки действий */}
      <td className={s.tdActions} onClick={(e) => e.stopPropagation()}>
        <div className={s.actionsWrap}>
          <button
            type="button"
            onClick={() => onEdit(user)}
            className={cn(s.actionBtn, s.actionEdit)}
            aria-label={`Редактировать пользователя ${user.username}`}
            title="Редактировать"
          >
            <Pencil size={14} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(user.username)}
            className={cn(s.actionBtn, s.actionDelete)}
            aria-label={`Удалить пользователя ${user.username}`}
            title="Удалить"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
