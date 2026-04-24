import { useMemo } from "react";
import { AlertTriangle, Clock, ServerOff } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ConnectionCard } from "@/components/common/ConnectionCard";
import { Guide } from "@/components/common/Guide";
import { TrafficChart } from "@/components/common/TrafficChart";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ServerSelector } from "@/components/common/ServerSelector";
import { NotifyBanner } from "@/components/common/NotifyBanner";
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
import { styles } from "@/styles";

const s = styles.profilePage;

// -------------------------------------------------------------
// Состояние загрузки — центрированный спиннер
// -------------------------------------------------------------

function LoadingState() {
  return (
    <AppShell>
      <div className={s.stateWrap}>
        <Spinner className="size-7" />
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
  // Данные плитки «Подписка» (текст, юниты, цвет)
  const subscriptionValue = getSubscriptionValue(
    expiresAt,
    daysLeft,
    timeLeft,
    expiryTier,
  );

  // Строка «дата, время» для блока «Подписка до»
  const expiryDateLine = expiresAt
    ? `${formatDate(expiresAt)}, ${formatTime(expiresAt)}`
    : null;

  // -- Рендер ----------------------------------------------
  return (
    <AppShell>
      <div className={s.root}>
        <div className={s.inner}>
          {/* -- Герой: аватар + имя + статус + дата истечения -- */}
          <Card className={s.heroCard}>
            <UserAvatar />

            <div className={s.heroContent}>
              <div className={s.heroTop}>
                {/* Имя + бейдж статуса */}
                <div className={s.heroNameWrap}>
                  <h1 className={s.heroName}>{profile.username}</h1>
                  <span className={cn(s.statusBadge, accountStatus.color)}>
                    {accountStatus.label}
                  </span>
                </div>

                {/* Дата окончания подписки */}
                <div className={s.heroExpiry}>
                  <p className={s.heroExpiryLabel}>Действует до</p>
                  <p className={s.heroExpiryDate}>
                    {expiryDateLine ?? "Не установлена"}
                  </p>
                </div>
              </div>

              <p className={s.heroRole}>Участник</p>
            </div>
          </Card>

          {/* -- Статистика: трафик + подписка ------------------- */}
          <div className={s.statsGrid}>
            {/* Плитка трафика */}
            <Card className={s.statCard}>
              <p className={s.statLabel}>Трафик</p>
              <div>
                <p className={s.statValue}>
                  {usedGb.toFixed(2)}
                  <span className={s.statUnit}>GB</span>
                </p>
                <p className={s.statSub}>из {DEFAULT_TRAFFIC_LIMIT_GB} GB</p>
              </div>
              <ProgressBar value={trafficPct} variant="traffic" />
            </Card>

            {/* Плитка подписки — значение зависит от expiryTier */}
            <Card className={s.statCard}>
              <p className={s.statLabel}>Подписка</p>
              <div>
                <div className={s.subValueWrap}>
                  {/* Иконка часов — только когда меньше суток */}
                  {"icon" in subscriptionValue && (
                    <Clock
                      size={14}
                      className={cn("shrink-0 mb-0.5", subscriptionValue.color)}
                    />
                  )}
                  <p
                    className={cn(
                      s.subValue,
                      "color" in subscriptionValue
                        ? subscriptionValue.color
                        : "text-foreground",
                    )}
                  >
                    {subscriptionValue.text}
                  </p>
                  {/* Единица измерения «дн.» — только для дней */}
                  {"unit" in subscriptionValue && (
                    <span className={s.subUnit}>{subscriptionValue.unit}</span>
                  )}
                </div>
                <p className={s.subValueSub}>{subscriptionValue.sub}</p>
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
    </AppShell>
  );
}
