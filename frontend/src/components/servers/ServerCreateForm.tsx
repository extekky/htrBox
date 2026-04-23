import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui/Modal";
import { FormInput } from "@/components/ui/FormInput";
import { ModalActions } from "@/components/ui/ModalActions";
import { ToggleCard } from "@/components/ui/ToggleCard";

import { useCreateServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import {
  createServerSchema,
  type CreateServerFormValues,
} from "@/lib/validators";

// -------------------------------------------------------------
// Форма создания сервера
// -------------------------------------------------------------

interface ServerCreateModalProps {
  onClose: () => void;
}

export function ServerCreateModal({ onClose }: ServerCreateModalProps) {
  const { mutate: createServer, isPending } = useCreateServer();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateServerFormValues>({
    resolver: zodResolver(createServerSchema),
    defaultValues: {
      port: 443,
      label: "VPN",
      protocol: "hysteria2",
      active: true,
    },
  });

  const active = watch("active");
  const ip = watch("ip");
  const domain = watch("domain");
  const port = watch("port");
  const hysteriaUrl = watch("hysteria_url");

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

  function onSubmit(values: CreateServerFormValues) {
    createServer(
      {
        ...values,
        domain: values.domain?.trim() || null,
        hysteria_url: values.hysteria_url?.trim() || null,
        label: values.label || "VPN",
      },
      {
        onSuccess: () => {
          success("Сервер добавлен");
          onClose();
        },
        onError: (e) => error("Ошибка добавления сервера", e.message),
      },
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Новый сервер"
      description="Регистрация VPN-сервера Hysteria2"
      size="lg"
      footer={
        <ModalActions
          formId="server-create-form"
          label="Добавить"
          onCancel={onClose}
          loading={isPending}
        />
      }
    >
      <form
        id="server-create-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        {/* Страна / Город */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Страна"
            placeholder="Россия"
            autoFocus
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
        <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-2 gap-3">
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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Hysteria URL (внутренний)
            </span>
            <button
              type="button"
              onClick={toggleTls}
              className={[
                "text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border transition-colors",
                useTls
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
              ].join(" ")}
            >
              {useTls ? "TLS ✓" : "Использовать TLS"}
            </button>
          </div>
          <FormInput
            placeholder="формируется автоматически"
            error={errors.hysteria_url?.message}
            className="font-mono bg-muted/50 text-muted-foreground cursor-default"
            readOnly
            {...register("hysteria_url")}
          />
        </div>

        {/* Активен */}
        <ToggleCard
          label="Активен сразу"
          description="Сервер будет доступен для подключений сразу после добавления"
          checked={!!active}
          onChange={(v) => setValue("active", v)}
        />
      </form>
    </Modal>
  );
}
