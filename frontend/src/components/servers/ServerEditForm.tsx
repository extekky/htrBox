import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui/Modal";
import { FormInput } from "@/components/ui/FormInput";
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

                {/* Hysteria URL — моноширинный инпут, используем FormInput с className */}
                <FormInput
                    label="Hysteria URL (внутренний)"
                    placeholder="http://1.2.3.4:8080"
                    error={errors.hysteria_url?.message}
                    className="font-mono"
                    {...register("hysteria_url")}
                />

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