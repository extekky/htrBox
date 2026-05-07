import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  KeyRound,
  AlertTriangle,
  Settings,
  BadgeCheck,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormInput } from "@/components/ui/FormInput";
import { ModalActions } from "@/components/ui/ModalActions";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToggleCard } from "@/components/ui/ToggleCard";
import { UserStatusPicker } from "@/components/users/UserStatusPicker";

import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";
import { createUserSchema, type CreateUserFormValues } from "@/lib/validators";
import { fromInputDatetimeLocal, toInputDatetimeLocal } from "@/lib/formatters";
import type { CreateUserResponse, UserStatusKey } from "@/api/types";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

const s = styles.userCreateModal;

type CreateTab = "main" | "statuses";

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
// Экран успеха — показывает сгенерированный Hysteria-пароль
// -------------------------------------------------------------

function SuccessScreen({
  data,
  onClose,
}: {
  data: CreateUserResponse;
  onClose: () => void;
}) {
  return (
    <div className={s.successRoot}>
      <div className={s.successHeader}>
        <div className={s.successIconWrap}>
          <CheckCircle2 size={18} className={s.successIcon} />
        </div>
        <div>
          <p className={s.successTitle}>Пользователь создан</p>
          <p className={s.successSubtitle}>{data.username}</p>
        </div>
      </div>

      <div className={s.successBlock}>
        <div className={s.successLabelRow}>
          <KeyRound size={13} className={s.successLabelIcon} />
          <FormLabel>Hysteria-пароль</FormLabel>
        </div>

        <div className={s.successCodeWrap}>
          <code className={s.successCode}>{data.hyPassword}</code>
          <CopyButton text={data.hyPassword} />
        </div>

        <p className={s.successHint}>
          <AlertTriangle size={11} className={s.successHintIcon} />
          Сохраните пароль — он больше не будет показан.
        </p>
      </div>

      <button onClick={onClose} className={s.successClose}>
        Готово
      </button>
    </div>
  );
}

// -------------------------------------------------------------
// Форма создания пользователя
// -------------------------------------------------------------

interface UserCreateModalProps {
  onClose: () => void;
}

export function UserCreateModal({ onClose }: UserCreateModalProps) {
  const { mutate: createUser, isPending } = useCreateUser();
  const { success, error } = useToast();
  const [created, setCreated] = useState<CreateUserResponse | null>(null);
  const [tab, setTab] = useState<CreateTab>("main");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      allowed: true,
      active: false,
      expires_at: null,
      statuses: [],
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

  function onSubmit(values: CreateUserFormValues) {
    const payload = {
      ...values,
      expires_at: values.expires_at
        ? fromInputDatetimeLocal(values.expires_at as string)
        : null,
    };

    createUser(payload, {
      onSuccess: (data) => {
        setCreated(data);
        success("Пользователь создан", data.username);
      },
      onError: (e) => error("Ошибка создания", e.message),
    });
  }

  const TABS: { id: CreateTab; label: string; icon: React.ReactNode }[] = [
    { id: "main", label: "Основное", icon: <Settings size={13} /> },
    { id: "statuses", label: "Статусы", icon: <BadgeCheck size={13} /> },
  ];

  if (created) {
    return (
      <Modal open onClose={onClose} title="Пользователь создан">
        <SuccessScreen data={created} onClose={onClose} />
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Новый пользователь"
      description="Hysteria url будет сгенерирован автоматически"
      footer={
        <ModalActions
          formId="user-create-form"
          label="Создать"
          onCancel={onClose}
          loading={isPending}
        />
      }
    >
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
        id="user-create-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={s.form}
      >
        {tab === "main" && (
          <>
            {/* Имя пользователя */}
            <FormInput
              label="Имя пользователя"
              placeholder="username"
              autoFocus
              autoComplete="off"
              error={errors.username?.message}
              {...register("username")}
            />

            {/* Пароль — глазик добавляется автоматически */}
            <FormInput
              label="Пароль"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className={s.divider} />

            {/* Тоглы доступа */}
            <div className={s.toggles}>
              <ToggleCard
                label="Доступ к сервису"
                description={allowed ? "Не забанен" : "Будет забанен"}
                checked={!!allowed}
                onChange={(v) => setValue("allowed", v)}
              />
              <ToggleCard
                label="Подписка"
                description={active ? "Будет активирована" : "Будет отключена"}
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
                Активировать — для неактивных: +29 дней от текущей даты.
                <br />
                Продлить — для активных: +29 дней от конечной даты.
              </p>
            </div>
          </>
        )}

        {tab === "statuses" && (
          <UserStatusPicker statuses={statuses} onToggle={toggleStatus} />
        )}
      </form>
    </Modal>
  );
}
