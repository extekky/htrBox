import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, AlertTriangle } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormInput } from "@/components/ui/FormInput";
import { ModalActions } from "@/components/ui/ModalActions";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToggleCard } from "@/components/ui/ToggleCard";

import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";
import { createUserSchema, type CreateUserFormValues } from "@/lib/validators";
import { fromInputDatetimeLocal } from "@/lib/formatters";
import type { CreateUserResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.userCreateModal;

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
    },
  });

  const allowed = watch("allowed");
  const active = watch("active");

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
      <form
        id="user-create-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={s.form}
      >
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
          label="Истекает (обязательно)"
          id="user-expires"
          type="datetime-local"
          error={errors.expires_at?.message}
          {...register("expires_at")}
        />
      </form>
    </Modal>
  );
}
