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
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-xs font-medium text-foreground">{children}</div>
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
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col gap-5">
        {/* Шапка — аватар + имя + роль + сколько осталось */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 overflow-hidden relative">
            <div className="absolute scale-[0.71] origin-top-left">
              <Avatar />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 flex-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-foreground">
                  {user.username}
                </span>
                {user.role === "admin" && (
                  <CheckCircle2 size={14} className="text-amber-500" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge type="allowed" value={user.allowed} />
                <StatusBadge type="active" value={user.active} />
              </div>
            </div>
            {user.expires_at ? (
              <span
                className={cn(
                  "text-xs",
                  expiryTier === "expired" || expiryTier === "critical"
                    ? "text-destructive"
                    : expiryTier === "warning"
                      ? "text-amber-500"
                      : "text-muted-foreground",
                )}
              >
                {formatDaysLeft(user.expires_at)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Нет даты</span>
            )}
          </div>
        </div>

        {/* Трафик */}
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Использовано трафика
            </span>
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {usedGb.toFixed(2)} / {DEFAULT_TRAFFIC_LIMIT_GB} GB
            </span>
          </div>
          <ProgressBar value={trafficPct} variant="traffic" />
        </div>

        {/* Детали */}
        <div className="flex flex-col px-0.5">
          <InfoRow label="Роль">
            <StatusBadge type="role" role={user.role} />
          </InfoRow>
          <InfoRow label="Истекает">
            {user.expires_at ? (
              <span className="text-foreground">
                {formatDate(user.expires_at)}, {formatTime(user.expires_at)}
              </span>
            ) : (
              <span className="text-muted-foreground">Нет даты</span>
            )}
          </InfoRow>
          <InfoRow label="Доступ">
            {user.allowed ? (
              <span className="flex items-center gap-1 text-green-500">
                <CircleCheck size={12} /> Ок
              </span>
            ) : (
              <span className="flex items-center gap-1 text-destructive">
                <CircleX size={12} /> Бан
              </span>
            )}
          </InfoRow>
          <InfoRow label="Подписка">
            {user.active ? (
              <span className="flex items-center gap-1 text-primary">
                <ShieldCheck size={12} /> Активна
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <ShieldOff size={12} /> Неактивна
              </span>
            )}
          </InfoRow>
        </div>

        {/* График трафика — берётся из TanStack, не подгружается заново */}
        <TrafficChart username={user.username} />
      </div>
    </Modal>
  );
}
