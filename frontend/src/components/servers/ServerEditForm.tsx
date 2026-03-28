import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormField } from "@/components/ui/FormField";
import { ModalActions } from "@/components/ui/ModalActions";
import { ToggleCard } from "@/components/ui/ToggleCard";

import { useUpdateServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import { updateServerSchema, type UpdateServerFormValues } from "@/lib/validators";
import type { ServerAdminResponse } from "@/api/types";

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

    function onSubmit(values: UpdateServerFormValues) {
        updateServer(
            {
                id: server.id,
                data: {
                    ...values,
                    domain: values.domain || null,
                    hysteria_url: values.hysteria_url || null,
                },
            },
            {
                onSuccess: () => { success("Сохранено", server.label || server.city); onClose(); },
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
                className="flex flex-col gap-4"
            >
                {/* Страна / Город */}
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Страна"
                        placeholder="Россия"
                        error={errors.country?.message}
                        {...register("country")}
                    />
                    <FormField
                        label="Город"
                        placeholder="Москва"
                        error={errors.city?.message}
                        {...register("city")}
                    />
                </div>

                {/* IP */}
                <FormField
                    label="IP-адрес"
                    placeholder="1.2.3.4"
                    error={errors.ip?.message}
                    {...register("ip")}
                />

                {/* Домен / Порт */}
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Домен (необязательно)"
                        placeholder="vpn.example.com"
                        error={errors.domain?.message}
                        {...register("domain")}
                    />
                    <FormField
                        label="Порт"
                        type="number"
                        placeholder="443"
                        error={errors.port?.message}
                        {...register("port", { valueAsNumber: true })}
                    />
                </div>

                {/* Название / Протокол */}
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Название"
                        placeholder="VPN"
                        error={errors.label?.message}
                        {...register("label")}
                    />
                    <FormField
                        label="Протокол"
                        placeholder="hysteria2"
                        error={errors.protocol?.message}
                        {...register("protocol")}
                    />
                </div>

                {/* Hysteria URL */}
                <div className="flex flex-col gap-1.5">
                    <FormLabel htmlFor="server-edit-hy-url">Hysteria URL (внутренний)</FormLabel>
                    <input
                        id="server-edit-hy-url"
                        {...register("hysteria_url")}
                        placeholder="http://1.2.3.4:8080"
                        className="h-9 w-full rounded-lg border border-border bg-input px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                    />
                    {errors.hysteria_url && (
                        <p className="text-xs text-destructive">{errors.hysteria_url.message}</p>
                    )}
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