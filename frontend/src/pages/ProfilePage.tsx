import { useMemo, useState } from "react";
import { AlertTriangle, Clock, GraduationCap, ServerOff } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ConnectionCard } from "@/components/common/ConnectionCard";
import { Guide } from "@/components/common/Guide";
import { TrafficChart } from "@/components/common/TrafficChart";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ServerSelector } from "@/components/common/ServerSelector";
import { NotifyBanner } from "@/components/common/NotifyBanner";
import { StatusChip } from "@/components/common/StatusBadge";
import { UserStatusList } from "@/components/common/UserStatusList";
import { pickAvatar } from "@/lib/avatars";
import { useMe } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import {
  useServerStore,
  selectSelectedServer,
  selectSetSelectedServer,
} from "@/stores/serverStore";
import {
  formatDate,
  formatTime,
  daysUntil,
  toGB,
  getExpiryTier,
} from "@/lib/formatters";
import { DEFAULT_TRAFFIC_LIMIT_GB } from "@/lib/constants";
import { cn } from "@/lib/cn";
import {
  useLiveCountdown,
  getAccountStatus,
  getSubscriptionValue,
  getExpiryPct,
} from "@/lib/utils";
import {
  getResolvedUserStatuses,
  getSchoolPrivilegeNote,
  getStatusPayload,
} from "@/lib/userStatuses";
import { styles, colorScheme } from "@/styles";

const s = styles.profilePage;

// -------------------------------------------------------------
// Состояние загрузки — центрированный спиннер
// -------------------------------------------------------------

function LoadingState() {
  return (
    <AppShell>
      <div className={s.stateWrap}>
        <Spinner size="lg" />
      </div>
    </AppShell>
  );
}

// -------------------------------------------------------------
// Состояние ошибки — иконка + поясняющий текст
// -------------------------------------------------------------

function ErrorState() {
  return (
    <AppShell>
      <div className={s.stateWrap}>
        <div className={s.stateInner}>
          <div className={s.stateIconWrap}>
            <AlertTriangle size={22} className={s.stateIcon} />
          </div>
          <p className={s.stateTitle}>Не удалось загрузить профиль</p>
          <p className={s.stateHint}>
            Проверьте соединение или обновите страницу
          </p>
        </div>
      </div>
    </AppShell>
  );
}

// -------------------------------------------------------------
// Основная страница профиля
// -------------------------------------------------------------

export function ProfilePage() {
  // -- Данные ----------------------------------------------
  const { data: me, isLoading: meLoading, isError: meError } = useMe();
  const user = useAuthStore((s) => s.user);
  const selectedServer = useServerStore(selectSelectedServer);
  const setSelectedServer = useServerStore(selectSetSelectedServer);
  const servers = useServerStore((s) => s.servers);
  const [selectedStatusKey, setSelectedStatusKey] = useState<string | null>(
    null,
  );

  // Фильтруем только активные серверы
  const activeServers = useMemo(
    () => servers.filter((s) => s.active),
    [servers],
  );

  // Предпочитаем свежие данные из API, fallback на кэш из authStore
  const profile = me ?? user;
  const expiresAt = profile?.expires_at ?? null;

  // Живой обратный отсчёт (обновляется каждую минуту)
  const timeLeft = useLiveCountdown(expiresAt);

  // -- Состояния загрузки и ошибки -------------------------
  if (meLoading) return <LoadingState />;
  if (meError && !user) return <ErrorState />;
  if (!profile) return null;

  // -- Вычисляемые значения ---------------------------------
  const UserAvatar = pickAvatar(profile.username);

  const usedGb = toGB(profile.usedTraffic);
  const trafficPct = Math.min(100, (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100);

  const daysLeft = daysUntil(expiresAt);
  const expiryTier = getExpiryTier(expiresAt);
  const expiryPct = getExpiryPct(daysLeft);

  // Флаг — VPN-ссылка доступна только когда allowed И active
  const isActive = profile.allowed && profile.active;

  // Бейдж статуса (цвет + лейбл) из общей утилиты
  const accountStatus = getAccountStatus(profile);
  const accountStatusTone = !profile.allowed
    ? colorScheme.danger
    : !profile.active
      ? colorScheme.warning
      : colorScheme.success;

  const accountStatusClass = cn(
    accountStatusTone.text,
    accountStatusTone.bg,
    accountStatusTone.border,
  );
  const statusPayload = getStatusPayload(profile);
  const userStatuses = getResolvedUserStatuses(statusPayload);
  const selectedStatus =
    userStatuses.find((status) => status.key === selectedStatusKey) ?? null;
  const schoolPrivilegeNote = getSchoolPrivilegeNote(statusPayload);

  // Данные плитки «Подписка» (текст, юниты, цвет)
  const subscriptionValue = getSubscriptionValue(
    expiresAt,
    daysLeft,
    timeLeft,
    expiryTier,
  );

  const subscriptionColor = !expiresAt
    ? s.subValueToneDefault
    : daysLeft !== null && daysLeft < 0
      ? s.subValueToneDanger
      : daysLeft === 0 && timeLeft
        ? timeLeft.hours < 1
          ? s.subValueToneDanger
          : s.subValueToneWarning
        : expiryTier === "critical" || expiryTier === "warning"
          ? s.subValueToneWarning
          : s.subValueToneDefault;

  // Дата / время для компактного блока подписки в hero-карточке
  const expiryDateValue = expiresAt ? formatDate(expiresAt) : null;
  const expiryTimeValue = expiresAt ? formatTime(expiresAt) : null;

  // -- Рендер ----------------------------------------------
  return (
    <AppShell>
      <div className={s.root}>
        <div className={s.inner}>
          {/* -- Герой: аватар + имя + статус + дата истечения -- */}
          <Card className={s.heroCard}>
            <div className={s.heroIdentity}>
              <div className={s.heroAvatar}>
                <UserAvatar />
              </div>

              <div className={s.heroContent}>
                <div className={s.heroNameWrap}>
                  <div className={s.heroNameRow}>
                    <h1 className={s.heroName}>{profile.username}</h1>
                  </div>

                  <div className={s.heroMetaRow}>
                    <StatusChip className={accountStatusClass}>
                      {accountStatus.label}
                    </StatusChip>

                    <UserStatusList
                      user={statusPayload}
                      interactive
                      onSelect={setSelectedStatusKey}
                      className={s.heroStatuses}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={s.heroExpiry}>
              <p className={s.heroExpiryLabel}>Подписка до</p>
              {expiryDateValue ? (
                <>
                  <p className={s.heroExpiryDate}>{expiryDateValue}</p>
                  <p className={s.heroExpiryTime}>{expiryTimeValue}</p>
                </>
              ) : (
                <p className={s.heroExpiryDate}>дата не установлена</p>
              )}
            </div>
          </Card>

          <NotifyBanner
            bannerId="school-user-free"
            visible={!!schoolPrivilegeNote}
            icon={GraduationCap}
            title="Бесплатный доступ!"
            description={schoolPrivilegeNote ?? undefined}
            variant="purple"
          />
          {/* -- Статистика: трафик + подписка ------------------- */}
          <div className={s.statsGrid}>
            {/* Плитка трафика */}
            <Card className={s.statCard}>
              <p className={s.statLabel}>Трафик</p>
              <div className={s.statBody}>
                <div className={s.statPrimaryRow}>
                  <p className={s.statValue}>
                    {usedGb.toFixed(2)}
                    <span className={s.statUnit}>Гб</span>
                  </p>
                </div>
                <div className={s.statSecondaryRow}>
                  <p className={s.statSub}>из {DEFAULT_TRAFFIC_LIMIT_GB} Гб</p>
                </div>
              </div>
              <ProgressBar value={trafficPct} variant="traffic" />
            </Card>

            {/* Плитка подписки — значение зависит от expiryTier */}
            <Card className={s.statCard}>
              <p className={s.statLabel}>Подписка</p>
              <div className={s.statBody}>
                <div className={s.statPrimaryRow}>
                  <div className={s.subValueWrap}>
                    {/* Иконка часов — только когда меньше суток */}
                    {"icon" in subscriptionValue && (
                      <Clock size={14} className={subscriptionColor} />
                    )}
                    <p className={cn(s.subValue, subscriptionColor)}>
                      {subscriptionValue.text}
                    </p>
                    {/* Единица измерения «дн.» — только для дней */}
                    {"unit" in subscriptionValue && (
                      <span className={s.subUnit}>
                        {subscriptionValue.unit}
                      </span>
                    )}
                  </div>
                </div>
                <div className={s.statSecondaryRow}>
                  <p className={s.subValueSub}>{subscriptionValue.sub}</p>
                </div>
              </div>
              <ProgressBar value={expiryPct} variant="expiry" />
            </Card>
          </div>

          {/* -- Баннер: подписка есть, но аккаунт не активирован -- */}
          <NotifyBanner
            bannerId="inactive-user"
            visible={profile.allowed && !profile.active}
            icon={AlertTriangle}
            title="Сервис стал платным"
            description={
              `Для продолжения работы оформите подписку у администратора.\n` +
              `Стабильность работы не гарантируется — возможны перебои.`
            }
            variant="warning"
          />

          {/* -- Онбординг-гайд — показываем пока нет даты истечения -- */}
          {!expiresAt && <Guide />}

          {/* -- Строка подключения + выбор сервера ------------------ */}
          {isActive && (
            <Card className={s.connectionCard}>
              <ConnectionCard />

              <div className={s.connectionDivider} />

              <div className={s.serverSection}>
                {/* Заголовок блока серверов */}
                <div className={s.serverHeader}>
                  <p className={s.serverLabel}>Сервер</p>
                  <span className={s.serverCount}>
                    {activeServers.length} доступно
                  </span>
                </div>

                {activeServers.length === 0 ? (
                  // Заглушка — нет активных серверов
                  <div className={s.emptyState}>
                    <div className={s.emptyIcon}>
                      <ServerOff size={18} />
                    </div>
                    <div className={s.emptyText}>
                      <p className={s.emptyTitle}>Нет доступных серверов</p>
                      <p className={s.emptyHint}>
                        Активные серверы временно недоступны
                      </p>
                    </div>
                  </div>
                ) : (
                  // Список серверов для выбора
                  <ServerSelector
                    servers={activeServers}
                    selectedServerId={selectedServer?.id ?? null}
                    onSelect={setSelectedServer}
                  />
                )}
              </div>
            </Card>
          )}

          {/* -- График трафика ---------------------------------- */}
          {isActive && <TrafficChart />}
        </div>
      </div>

      {selectedStatus && (
        <Modal
          open
          onClose={() => setSelectedStatusKey(null)}
          title={selectedStatus.label}
          description="Что означает этот статус"
          size="sm"
        >
          <div className={s.statusModalBody}>
            <UserStatusList
              user={{
                role: selectedStatus.key === "admin" ? "admin" : "user",
                statuses:
                  selectedStatus.key === "admin" ? [] : [selectedStatus.key],
              }}
              className={s.statusModalStatus}
            />
            <p className={s.statusModalText}>{selectedStatus.description}</p>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
