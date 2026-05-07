import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RefreshCw,
  Shield,
  ShieldOff,
  KeyRound,
  Check,
  Copy,
  Settings,
  Loader2,
  AlertTriangle,
  Activity,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormInput } from "@/components/ui/FormInput";
import { ModalActions } from "@/components/ui/ModalActions";
import { ToggleCard } from "@/components/ui/ToggleCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserStatusPicker } from "@/components/users/UserStatusPicker";

import {
  useUpdateUser,
  useSetRole,
  useRegenerateHy,
  useResetTraffic,
} from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";
import { updateUserSchema, type UpdateUserFormValues } from "@/lib/validators";
import {
  fromInputDatetimeLocal,
  toInputDatetimeLocal,
  toGB,
} from "@/lib/formatters";
import { DEFAULT_TRAFFIC_LIMIT_GB } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { UserResponse, UserStatusKey } from "@/api/types";
import { styles } from "@/styles";

const s = styles.userEditModal;

type Tab = "main" | "statuses" | "access" | "traffic";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseFormExpiry(value: string | null | undefined) {
  if (!value) return null;

  const iso = fromInputDatetimeLocal(value);
  if (!iso) return null;

  const date = new Date(iso);
  return isNaN(date.getTime()) ? null : date;
}

// -------------------------------------------------------------
// Вкладка «Доступ» — роль и Hysteria-пароль
// -------------------------------------------------------------

function AccessTab({
  user,
  register,
  errors,
}: {
  user: UserResponse;
  register: any;
  errors: any;
}) {
  const { mutate: setRole, isPending: rolePending } = useSetRole();
  const { mutate: regenerateHy, isPending: regenPending } = useRegenerateHy();
  const { success, error } = useToast();

  const [confirmRole, setConfirmRole] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [newHyPass, setNewHyPass] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleRoleToggle() {
    const newRole = user.role === "admin" ? "user" : "admin";
    setRole(
      { username: user.username, data: { role: newRole } },
      {
        onSuccess: () => {
          success(`Роль изменена -> ${newRole}`, user.username);
          setConfirmRole(false);
        },
        onError: (e) => {
          error("Ошибка смены роли", e.message);
          setConfirmRole(false);
        },
      },
    );
  }

  function handleRegen() {
    regenerateHy(user.username, {
      onSuccess: (data) => {
        setNewHyPass(data.hyPassword);
        success("Hysteria-пароль обновлён", user.username);
        setConfirmRegen(false);
      },
      onError: (e) => {
        error("Ошибка регенерации", e.message);
        setConfirmRegen(false);
      },
    });
  }

  function copyHyPass() {
    if (!newHyPass) return;
    navigator.clipboard.writeText(newHyPass).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isAdmin = user.role === "admin";

  return (
    <div className={s.accessRoot}>
      {/* Смена роли */}
      <div className={s.accessRoleCard}>
        <div className={s.accessRoleHead}>
          <div
            className={cn(
              s.accessRoleIconWrap,
              isAdmin ? s.accessRoleIconAdmin : s.accessRoleIconDefault,
            )}
          >
            {isAdmin ? <Shield size={15} /> : <ShieldOff size={15} />}
          </div>
          <div>
            <p className={s.accessRoleTitle}>
              Роль:{" "}
              <span
                className={cn(
                  isAdmin ? s.accessRoleValueAdmin : s.accessRoleValueDefault,
                )}
              >
                {user.role}
              </span>
            </p>
            <p className={s.accessRoleHint}>
              {isAdmin ? "Полный доступ к панели" : "Обычный пользователь"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmRole(true)}
          disabled={rolePending}
          className={s.accessRoleButton}
        >
          {rolePending ? (
            <Loader2 size={12} className={s.spinner} />
          ) : (
            <RefreshCw size={12} />
          )}
          Сменить
        </button>
      </div>

      {/* Регенерация Hysteria-пароля */}
      <div className={s.accessHyCard}>
        <div className={s.accessHyTop}>
          <div className={s.accessHyHead}>
            <div className={s.accessHyIconWrap}>
              <KeyRound size={15} />
            </div>
            <div>
              <p className={s.accessHyTitle}>Hysteria-пароль</p>
              <p className={s.accessHyHint}>
                Инвалидирует текущую строку подключения
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmRegen(true)}
            disabled={regenPending}
            className={s.accessHyButton}
          >
            {regenPending ? (
              <Loader2 size={12} className={s.spinner} />
            ) : (
              <RefreshCw size={12} />
            )}
            Сгенерировать
          </button>
        </div>

        {newHyPass && (
          <>
            <div className={s.accessNewPassWrap}>
              <code className={s.accessNewPassCode}>{newHyPass}</code>
              <button
                type="button"
                onClick={copyHyPass}
                className={s.accessCopyButton}
              >
                {copied ? (
                  <Check size={13} className={s.accessCopyDoneIcon} />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
            <p className={s.accessNewPassHint}>
              <AlertTriangle size={11} />
              Сохраните пароль — он больше не будет показан
            </p>
          </>
        )}
      </div>

      <div className={s.divider} />

      {/* Новый пароль */}
      <FormInput
        label="Новый пароль"
        type="password"
        placeholder="Оставьте пустым, чтобы не менять"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <ConfirmDialog
        open={confirmRole}
        onClose={() => setConfirmRole(false)}
        onConfirm={handleRoleToggle}
        title={`Сменить роль на «${isAdmin ? "user" : "admin"}»?`}
        description={
          isAdmin
            ? `«${user.username}» потеряет доступ к панели администратора.`
            : `«${user.username}» получит полный доступ к панели администратора.`
        }
        confirmLabel="Сменить"
        loading={rolePending}
      />

      <ConfirmDialog
        open={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        onConfirm={handleRegen}
        title="Обновить Hysteria-пароль?"
        description={`Текущая строка подключения «${user.username}» перестанет работать. Потребуется скопировать новую.`}
        confirmLabel="Обновить"
        loading={regenPending}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Вкладка «Трафик» — сброс счётчика
// -------------------------------------------------------------

function TrafficTab({ user }: { user: UserResponse }) {
  const { mutate: resetTraffic, isPending } = useResetTraffic();
  const { success, error } = useToast();

  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    resetTraffic(user.username, {
      onSuccess: () => {
        success("Трафик сброшен", user.username);
        setConfirmReset(false);
      },
      onError: (e) => {
        error("Ошибка сброса трафика", e.message);
        setConfirmReset(false);
      },
    });
  }

  return (
    <div className={s.trafficRoot}>
      {/* Кнопка сброса */}
      <div className={s.trafficResetCard}>
        <div className={s.trafficResetHead}>
          <div className={s.trafficResetIconWrap}>
            <RotateCcw size={15} />
          </div>
          <div>
            <p className={s.trafficResetTitle}>Сбросить счётчик</p>
            <p className={s.trafficResetHint}>
              Обнулить траффик пользователя. Исторические данные графика
              сохранятся.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          disabled={isPending}
          className={s.trafficResetButton}
        >
          {isPending ? (
            <Loader2 size={12} className={s.spinner} />
          ) : (
            <RotateCcw size={12} />
          )}
          Сбросить
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Сбросить трафик?"
        description={`Счётчик трафика «${user.username}» будет обнулён. Исторические данные графика сохранятся.`}
        confirmLabel="Сбросить"
        loading={isPending}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Модальное окно редактирования пользователя
// -------------------------------------------------------------

interface UserEditModalProps {
  user: UserResponse;
  onClose: () => void;
}

export function UserEditModal({ user, onClose }: UserEditModalProps) {
  const [tab, setTab] = useState<Tab>("main");

  const { mutate: updateUser, isPending } = useUpdateUser();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      allowed: user.allowed,
      active: user.active,
      password: "",
      expires_at: toInputDatetimeLocal(user.expires_at),
      statuses: user.statuses,
    },
  });

  const allowed = watch("allowed");
  const active = watch("active");
  const expiresAt = watch("expires_at");
  const statuses = watch("statuses");

  const now = new Date();
  const expiryDate = parseFormExpiry(expiresAt);
  const hasActiveSubscription = !!active && !!expiryDate && expiryDate > now;
  const canStartSubscription = !expiryDate || expiryDate <= now;

  function toggleStatus(status: UserStatusKey) {
    const next = statuses.includes(status)
      ? statuses.filter((item) => item !== status)
      : [...statuses, status];

    setValue("statuses", next, { shouldValidate: true });
  }

  function extendActiveSubscription() {
    if (!hasActiveSubscription || !expiryDate) return;

    setValue(
      "expires_at",
      toInputDatetimeLocal(addDays(expiryDate, 29).toISOString()),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function startExpiredSubscription() {
    if (!canStartSubscription) return;

    setValue("active", true, { shouldDirty: true, shouldValidate: true });
    setValue(
      "expires_at",
      toInputDatetimeLocal(addDays(now, 29).toISOString()),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function onSubmit(values: UpdateUserFormValues) {
    const data: UpdateUserFormValues = {
      allowed: values.allowed,
      active: values.active,
      expires_at: values.expires_at
        ? fromInputDatetimeLocal(values.expires_at as string)
        : null,
      statuses: values.statuses,
    };
    if (values.password) data.password = values.password;

    updateUser(
      { username: user.username, data },
      {
        onSuccess: () => {
          success("Сохранено", user.username);
          onClose();
        },
        onError: (e) => error("Ошибка сохранения", e.message),
      },
    );
  }

  const usedGb = toGB(user.usedTraffic);
  const trafficPct = Math.min(100, (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "main", label: "Основное", icon: <Settings size={13} /> },
    { id: "statuses", label: "Статусы", icon: <BadgeCheck size={13} /> },
    { id: "access", label: "Доступ", icon: <Shield size={13} /> },
    { id: "traffic", label: "Трафик", icon: <Activity size={13} /> },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Редактировать пользователя"
      footer={
        tab !== "traffic" ? (
          <ModalActions
            formId="user-edit-form"
            label="Сохранить"
            onCancel={onClose}
            loading={isPending}
          />
        ) : (
          <button type="button" onClick={onClose} className={s.closeButton}>
            Закрыть
          </button>
        )
      }
    >
      <div className={s.root}>
        {/* Карточка пользователя с мини-баром трафика */}
        <div className={s.summary}>
          <div className={s.summaryInfo}>
            <p className={s.summaryName}>{user.username}</p>
            <p className={s.summaryRole}>{user.role}</p>
          </div>
          <div className={s.summaryTraffic}>
            <span className={s.summaryTrafficText}>
              {usedGb.toFixed(2)} / {DEFAULT_TRAFFIC_LIMIT_GB} GB
            </span>
            <div className={s.summaryTrafficTrack}>
              <div
                className={cn(
                  s.summaryTrafficFill,
                  trafficPct > 90
                    ? s.summaryTrafficFillDanger
                    : trafficPct > 70
                      ? s.summaryTrafficFillWarning
                      : s.summaryTrafficFillPrimary,
                )}
                style={{ width: `${trafficPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className={s.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                s.tabButton,
                tab === t.id ? s.tabButtonActive : s.tabButtonDefault,
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <form
          id="user-edit-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={s.mainForm}
        >
          {/* Основная вкладка */}
          {tab === "main" && (
            <>
              <div className={s.mainToggles}>
                <ToggleCard
                  label="Доступ к сервису"
                  description={allowed ? "Не забанен" : "Будет забанен"}
                  checked={!!allowed}
                  onChange={(v) => setValue("allowed", v)}
                />
                <ToggleCard
                  label="Подписка"
                  description={
                    active ? "Будет активирована" : "Будет отключена"
                  }
                  checked={!!active}
                  onChange={(v) => setValue("active", v)}
                />
              </div>

              <div className={s.divider} />

              {/* Дата истечения — нативный datetime-local */}
              <FormInput
                label="Истекает"
                id="user-expires"
                type="datetime-local"
                error={errors.expires_at?.message}
                {...register("expires_at")}
              />

              <div className={s.subscriptionQuick}>
                <FormLabel>Быстрое продление</FormLabel>
                <div className={s.subscriptionActions}>
                  <button
                    type="button"
                    onClick={extendActiveSubscription}
                    disabled={!hasActiveSubscription}
                    className={s.subscriptionButton}
                  >
                    Продлить
                  </button>
                  <button
                    type="button"
                    onClick={startExpiredSubscription}
                    disabled={!canStartSubscription}
                    className={s.subscriptionButton}
                  >
                    Активировать
                  </button>
                </div>
                <p className={s.subscriptionHint}>
                  Продлить — для активных: +29 дней от конечной даты.
                  <br />
                  Активировать — для неактивных: +29 дней от текущей даты.
                </p>
              </div>
            </>
          )}

          {tab === "statuses" && (
            <UserStatusPicker statuses={statuses} onToggle={toggleStatus} />
          )}

          {tab === "access" && (
            <AccessTab user={user} register={register} errors={errors} />
          )}
        </form>

        {tab === "traffic" && <TrafficTab user={user} />}
      </div>
    </Modal>
  );
}
