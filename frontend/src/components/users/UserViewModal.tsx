import {
  ShieldCheck,
  ShieldOff,
  CircleCheck,
  CircleX,
  CheckCircle2,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { TrafficChart } from "@/components/common/TrafficChart";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { pickAvatar } from "@/lib/avatars";
import {
  toGB,
  formatDate,
  formatTime,
  formatDaysLeft,
  getExpiryTier,
} from "@/lib/formatters";
import { DEFAULT_TRAFFIC_LIMIT_GB } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { UserResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.userViewModal;

interface UserViewModalProps {
  user: UserResponse;
  onClose: () => void;
}

// Вспомогательный компонент для отображения строки с меткой и значением
function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={s.infoRow}>
      <span className={s.infoLabel}>{label}</span>
      <div className={s.infoValue}>{children}</div>
    </div>
  );
}

/**
 * Модальное окно для просмотра профиля пользователя.
 *
 * - Показывает аватар, имя, роль и статус доступа.
 * - Отображает прогресс-бар использования трафика с числовыми значениями.
 * - Информирует о сроке действия подписки с цветовой индикацией.
 * - Включает график трафика за последние дни (через компонент TrafficChart).
 */
export function UserViewModal({ user, onClose }: UserViewModalProps) {
  const usedGb = toGB(user.usedTraffic);
  const trafficPct = Math.min(100, (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100);
  const expiryTier = user.expires_at ? getExpiryTier(user.expires_at) : null;

  const Avatar = pickAvatar(user.username);

  return (
    <Modal
      open
      onClose={onClose}
      title="Профиль пользователя"
      size="lg"
      className={s.modal}
    >
      <div className={s.root}>
        {/* Шапка — аватар + имя + роль + сколько осталось */}
        <div className={s.header}>
          <div className={s.avatarWrap}>
            <div className={s.avatarInner}>
              <Avatar />
            </div>
          </div>
          <div className={s.headerContent}>
            <div className={s.userMeta}>
              <div className={s.userNameRow}>
                <span className={s.userName}>{user.username}</span>
              </div>
              <div className={s.badges}>
                <StatusBadge type="allowed" value={user.allowed} />
                <StatusBadge type="active" value={user.active} />
              </div>
            </div>
            {user.expires_at ? (
              <span
                className={cn(
                  s.expiryText,
                  expiryTier === "expired" || expiryTier === "critical"
                    ? s.expiryDanger
                    : expiryTier === "warning"
                      ? s.expiryWarning
                      : s.expiryDefault,
                )}
              >
                {formatDaysLeft(user.expires_at)}
              </span>
            ) : (
              <span className={cn(s.expiryText, s.expiryDefault)}>
                Нет даты
              </span>
            )}
          </div>
        </div>

        {/* Трафик */}
        <div className={s.trafficCard}>
          <div className={s.trafficHead}>
            <span className={s.trafficLabel}>Использовано трафика</span>
            <span className={s.trafficValue}>
              {usedGb.toFixed(2)} / {DEFAULT_TRAFFIC_LIMIT_GB} GB
            </span>
          </div>
          <ProgressBar value={trafficPct} variant="traffic" />
        </div>

        {/* Детали */}
        <div className={s.details}>
          <InfoRow label="Роль">
            <StatusBadge type="role" role={user.role} />
          </InfoRow>
          <InfoRow label="Истекает">
            {user.expires_at ? (
              <span className={s.infoValue}>
                {formatDate(user.expires_at)}, {formatTime(user.expires_at)}
              </span>
            ) : (
              <span className={s.expiryDefault}>Нет даты</span>
            )}
          </InfoRow>
          <InfoRow label="Доступ">
            {user.allowed ? (
              <span className={s.allowedTrue}>Ок</span>
            ) : (
              <span className={s.allowedFalse}>Бан</span>
            )}
          </InfoRow>
          <InfoRow label="Подписка">
            {user.active ? (
              <span className={s.activeTrue}>Активна</span>
            ) : (
              <span className={s.activeFalse}> Неактивна</span>
            )}
          </InfoRow>
        </div>

        {/* График трафика — берётся из TanStack, не подгружается заново */}
        <TrafficChart username={user.username} />
      </div>
    </Modal>
  );
}
