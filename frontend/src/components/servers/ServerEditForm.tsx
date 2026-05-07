import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui/Modal";
import { FormInput } from "@/components/ui/FormInput";
import { ModalActions } from "@/components/ui/ModalActions";
import { ToggleCard } from "@/components/ui/ToggleCard";

import { useUpdateServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import {
  updateServerSchema,
  type UpdateServerFormValues,
} from "@/lib/validators";
import type { ServerAdminResponse } from "@/api/types";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

const s = styles.serverForm;

// -------------------------------------------------------------
// Форма редактирования сервера
// -------------------------------------------------------------

interface ServerEditModalProps {
  server: ServerAdminResponse;
  onClose: () => void;
}

export function ServerEditModal({ server, onClose }: ServerEditModalProps) {
  const { mutate: updateServer, isPending } = useUpdateServer();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateServerFormValues>({
    resolver: zodResolver(updateServerSchema),
    defaultValues: {
      country: server.country,
      city: server.city,
      ip: server.ip,
      domain: server.domain ?? "",
      port: server.port,
      label: server.label,
      protocol: server.protocol,
      hysteria_url: server.hysteria_url ?? "",
      active: server.active,
    },
  });

  const active = watch("active");
  const ip = watch("ip");
  const domain = watch("domain");
  const port = watch("port");
  const hysteriaUrl = watch("hysteria_url");

  // Выводим состояние TLS из текущего значения hysteria_url
  const useTls = hysteriaUrl?.startsWith("https://") ?? false;

  // Автоматическое построение hysteria_url при изменении ip, домена, порта или TLS-переключателя
  useEffect(() => {
    const host = domain?.trim() || ip?.trim() || "";
    const scheme = useTls ? "https" : "http";
    if (host && port) {
      setValue("hysteria_url", `${scheme}://${host}:${port}`);
    }
    // eslint-disable-next-line реагирует на перехваты/исчерпывающие проверки
  }, [ip, domain, port, useTls]);

  function toggleTls() {
    const current = watch("hysteria_url") ?? "";
    if (current.startsWith("https://")) {
      setValue("hysteria_url", current.replace(/^https:\/\//, "http://"));
    } else {
      setValue("hysteria_url", current.replace(/^http:\/\//, "https://"));
    }
  }

  function onSubmit(values: UpdateServerFormValues) {
    updateServer(
      {
        id: server.id,
        data: {
          ...values,
          // Explicitly send null when domain is empty so the server
          // clears the field — an empty string would be ignored.
          domain: values.domain?.trim() || null,
          hysteria_url: values.hysteria_url?.trim() || null,
        },
      },
      {
        onSuccess: () => {
          success("Сохранено", server.label || server.city);
          onClose();
        },
        onError: (e) => error("Ошибка сохранения сервера", e.message),
      },
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Редактировать сервер"
      description={`${server.country} · ${server.city} · ${server.ip}`}
      size="lg"
      footer={
        <ModalActions
          formId="server-edit-form"
          label="Сохранить"
          onCancel={onClose}
          loading={isPending}
        />
      }
    >
      <form
        id="server-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={s.form}
      >
        {/* Страна / Город */}
        <div className={s.gridTwo}>
          <FormInput
            label="Страна"
            placeholder="Россия"
            error={errors.country?.message}
            {...register("country")}
          />
          <FormInput
            label="Город"
            placeholder="Москва"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>

        {/* IP */}
        <FormInput
          label="IP-адрес"
          placeholder="1.2.3.4"
          error={errors.ip?.message}
          {...register("ip")}
        />

        {/* Домен / Порт */}
        <div className={s.gridTwo}>
          <FormInput
            label="Домен (необязательно)"
            placeholder="vpn.example.com"
            error={errors.domain?.message}
            {...register("domain")}
          />
          <FormInput
            label="Порт"
            type="number"
            placeholder="443"
            error={errors.port?.message}
            {...register("port", { valueAsNumber: true })}
          />
        </div>

        {/* Название / Протокол */}
        <div className={s.gridTwo}>
          <FormInput
            label="Название"
            placeholder="VPN"
            error={errors.label?.message}
            {...register("label")}
          />
          <FormInput
            label="Протокол"
            placeholder="hysteria2"
            error={errors.protocol?.message}
            {...register("protocol")}
          />
        </div>

        {/* Hysteria URL — формируется автоматически */}
        <div className={s.hyWrap}>
          <div className={s.hyTop}>
            <span className={s.hyLabel}>Hysteria URL (внутренний)</span>
            <button
              type="button"
              onClick={toggleTls}
              className={cn(
                s.tlsButton,
                useTls ? s.tlsButtonOn : s.tlsButtonOff,
              )}
            >
              {useTls ? "TLS ✓" : "Использовать TLS"}
            </button>
          </div>
          <FormInput
            placeholder="формируется автоматически"
            error={errors.hysteria_url?.message}
            className={s.hyInput}
            readOnly
            {...register("hysteria_url")}
          />
        </div>

        {/* Активен */}
        <ToggleCard
          label="Активен"
          description="Сервер доступен для подключений"
          checked={!!active}
          onChange={(v) => setValue("active", v)}
        />
      </form>
    </Modal>
  );
}
