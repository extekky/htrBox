/**
 * FormField — переиспользуемое поле формы.
 *
 * Объединяет метку (FormLabel), input и текст ошибки в один компонент.
 * Принимает все стандартные атрибуты <input> через forwardRef,
 * поэтому совместим с react-hook-form {...register(...)}.
 *
 * @example
 * <FormField
 *   label="Имя пользователя"
 *   placeholder="username"
 *   error={errors.username?.message}
 *   {...register("username")}
 * />
 */

import * as React from "react";
import { FormLabel } from "@/components/ui/FormLabel";
import { cn } from "@/lib/cn";

export interface FormFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Текст метки над полем. */
    label: string;
    /** Сообщение об ошибке валидации. Подсвечивает рамку красным. */
    error?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, error, id, className, ...props }, ref) => {
        // Генерируем id из label если не передан явно
        const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                <FormLabel htmlFor={fieldId}>{label}</FormLabel>
                <input
                    ref={ref}
                    id={fieldId}
                    className={cn(
                        "h-9 w-full rounded-lg border bg-input px-3 text-sm text-foreground",
                        "placeholder:text-muted-foreground/40",
                        "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors",
                        error ? "border-destructive" : "border-border",
                        className,
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}
            </div>
        );
    },
);

FormField.displayName = "FormField";