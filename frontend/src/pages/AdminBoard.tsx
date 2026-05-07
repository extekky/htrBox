import {
  Users,
  Server,
  Wifi,
  Clock,
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  Activity,
} from "lucide-react";

import { Link } from "wouter";

import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui/Spinner";
import { useUsers } from "@/hooks/useUsers";
import { useServersAdmin } from "@/hooks/useServers";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useOnlineUsers } from "@/hooks/useHysteria";
import { msUntil, daysUntil, formatDaysLeft } from "@/lib/formatters";

import { cn } from "@/lib/cn";

import {
  SectionCard,
  SectionRow,
  SectionEmpty,
} from "@/components/dashboard/SectionCard";
import { styles } from "@/styles";

const s = styles.adminBoardPage;

// -------------------------------------------------------------
// Компонент панели администратора
// -------------------------------------------------------------

/**
 * Главная страница администратора (Dashboard).
 * Отображает ключевые метрики системы, состояние серверов и список активных пользователей.
 *
 * - Загружает данные о пользователях и серверах.
 * - Рассчитывает статистику (активные, заблокированные, истекающие).
 * - Отображает текущий онлайн через Hysteria API.
 */
export function AdminBoard() {
  // Загрузка данных из хуков
  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useUsers();
  const {
    data: servers = [],
    isLoading: serversLoading,
    isError: serversError,
  } = useServersAdmin();
  const { data: online = {}, isError: onlineError } = useOnlineUsers();

  const isLoading = usersLoading || serversLoading;
  const isError = usersError || serversError;

  // -------------------------------------------------------------
  // Расчет статистики
  // -------------------------------------------------------------

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active && u.allowed).length;
  const blockedUsers = users.filter((u) => !u.allowed).length;

  // Пользователи, чья подписка истекает в ближайшие 7 дней
  const expiringUsers = users.filter((u) => {
    const ms = msUntil(u.expires_at);
    const days = daysUntil(u.expires_at);
    return ms !== null && ms > 0 && days !== null && days <= 7;
  });

  const activeServers = servers.filter((s) => s.active).length;
  const onlineCount = Object.keys(online).length;

  // -------------------------------------------------------------
  // Состояния загрузки и ошибок
  // -------------------------------------------------------------

  if (isLoading) {
    return (
      <AppShell>
        <div className={s.loadingWrap}>
          <Spinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <div className={s.errorWrap}>
          <div className={s.errorInner}>
            <div className={s.errorIconWrap}>
              <AlertTriangle size={20} className={s.errorIcon} />
            </div>
            <p className={s.errorTitle}>Не удалось загрузить данные</p>
            <p className={s.errorHint}>
              Проверьте соединение или обновите страницу
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={s.root}>
        {/* Заголовок страницы */}
        <div className={s.header}>
          <div>
            <h1 className={s.title}>Дашборд</h1>
            <p className={s.subtitle}>Обзор системы в реальном времени</p>
          </div>
        </div>

        {/* Уведомление об истекающих подписках */}
        {expiringUsers.length > 0 && (
          <Link href="/users">
            <div className={s.expiringAlert}>
              <div className={s.expiringAlertIconWrap}>
                <ShieldAlert size={15} />
              </div>
              <p className={s.expiringAlertText}>
                <strong className={s.expiringAlertCount}>
                  {expiringUsers.length}
                </strong>{" "}
                подписок истекают в течение 7 дней
              </p>
              <ChevronRight size={14} className={s.expiringAlertChevron} />
            </div>
          </Link>
        )}

        {/* Секция KPI: Пользователи */}
        <div>
          <p className={s.kpiSectionTitle}>Пользователи</p>
          <div className={s.kpiUsers}>
            <KpiCard
              label="Всего"
              value={totalUsers}
              sub="аккаунтов"
              icon={Users}
              accent="blue"
            />
            <KpiCard
              label="Активных"
              value={activeUsers}
              sub="с подпиской"
              icon={Wifi}
              accent="green"
            />
            <KpiCard
              label="Забанено"
              value={blockedUsers}
              icon={ShieldAlert}
              accent={blockedUsers > 0 ? "red" : "default"}
            />
            <KpiCard
              label="Истекают"
              value={expiringUsers.length}
              sub="≤ 7 дней"
              icon={Clock}
              accent={expiringUsers.length > 0 ? "amber" : "default"}
            />
          </div>
        </div>

        {/* Секция KPI: Инфраструктура */}
        <div>
          <p className={s.kpiSectionTitle}>Инфраструктура</p>
          <div className={s.kpiInfra}>
            <KpiCard
              label="Серверов"
              value={servers.length}
              sub="всего"
              icon={Server}
              accent="blue"
            />
            <KpiCard
              label="Активных"
              value={activeServers}
              icon={Server}
              accent="green"
            />
            <KpiCard
              label="Онлайн"
              value={onlineCount}
              sub="сейчас"
              icon={Activity}
              accent={onlineCount > 0 ? "purple" : "default"}
            />
          </div>
        </div>

        {/* Сетка детальных секций */}
        <div className={s.detailGrid}>
          {/* Список пользователей онлайн */}
          <SectionCard
            title="Онлайн сейчас"
            badge={
              <span
                className={cn(
                  s.onlineBadge,
                  onlineCount > 0 ? s.onlineBadgeOn : s.onlineBadgeOff,
                )}
              >
                {onlineCount > 0 && <span className={s.onlineBadgeDot} />}
                {onlineCount}
              </span>
            }
            action={
              <Link href="/users">
                <span className={s.sectionAction}>
                  Все <ChevronRight size={12} />
                </span>
              </Link>
            }
          >
            {onlineError ? (
              <SectionEmpty label="Нет активных серверов" />
            ) : onlineCount === 0 ? (
              <SectionEmpty label="Никого нет онлайн" />
            ) : (
              Object.entries(online).map(([username, info]) => (
                <SectionRow key={username}>
                  <div className={s.sectionRowMain}>
                    <span className={s.sectionRowName}>{username}</span>
                  </div>
                  <span className={s.sectionRowMeta}>{info.connections} соед.</span>
                </SectionRow>
              ))
            )}
          </SectionCard>

          {/* Список истекающих подписок */}
          <SectionCard
            title="Истекают скоро"
            badge={
              expiringUsers.length > 0 ? (
                <span className={s.expiringBadge}>{expiringUsers.length}</span>
              ) : undefined
            }
            action={
              <Link href="/users">
                <span className={s.sectionAction}>
                  Все <ChevronRight size={12} />
                </span>
              </Link>
            }
          >
            {expiringUsers.length === 0 ? (
              <SectionEmpty label="Все подписки в порядке" />
            ) : (
              expiringUsers.slice(0, 6).map((u) => {
                const ms = msUntil(u.expires_at);
                const days = daysUntil(u.expires_at);
                const urgent =
                  (ms !== null && ms <= 0) || (days !== null && days <= 1);

                return (
                  <SectionRow key={u.username}>
                    <div className={s.sectionRowMain}>
                      <span className={s.sectionRowName}>{u.username}</span>
                    </div>
                    <span
                      className={cn(
                        s.expiringStatus,
                        urgent ? s.expiringStatusUrgent : s.expiringStatusWarning,
                      )}
                    >
                      {formatDaysLeft(u.expires_at)}
                    </span>
                  </SectionRow>
                );
              })
            )}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
