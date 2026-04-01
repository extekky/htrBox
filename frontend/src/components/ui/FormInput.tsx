/**
 * FormInput — универсальное поле формы с меткой, инпутом и ошибкой.
 *
 *  Возможности:
 *   - кнопки «показать/скрыть пароль» для type="password"
 *   - иконки слева через проп `icon`
 *   - кастомного правого слота через `rightSlot`
 *   - специальное визуальное выделение пустых datetime-local полей
 *
 * Совместим с react-hook-form через forwardRef — просто передай {...register("field")}.
 *
 * @example — обычное поле
 * <FormInput
 *   label="Пользователь"
 *   placeholder="username"
 *   error={errors.username?.message}
 *   {...register("username")}
 * />
 *
 * @example — поле пароля с глазиком (автоматически)
 * <FormInput
 *   label="Пароль"
 *   type="password"
 *   placeholder="••••••••"
 *   error={errors.password?.message}
 *   {...register("password")}
 * />
 *
 * @example — datetime-local поле с визуальным выделением пустого состояния
 * <FormInput
 *   label="Дата и время"
 *   type="datetime-local"
 *   error={errors.datetime?.message}
 *   {...register("datetime")}
 * />
 */

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FormLabel } from "@/components/ui/FormLabel";
import { cn } from "@/lib/cn";

export interface FormInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Текст метки над полем. Если не передан — лейбл не рендерится. */
    label?: string;
    /** Сообщение об ошибке валидации. Подсвечивает рамку красным. */
    error?: string;
    /** Иконка слева внутри поля (необязательно). */
    icon?: React.ReactNode;
    /** Произвольный слот справа внутри поля (переопределяет глазик у пароля). */
    rightSlot?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, id, type, icon, rightSlot, className, ...props }, ref) => {
        // Состояние видимости для полей пароля
        const [showPassword, setShowPassword] = useState(false);

        const fieldId = id ?? (label
            ? label.toLowerCase().replace(/\s+/g, "-")
            : Math.random().toString(36).slice(2));

        // Для password-поля подменяем тип и добавляем кнопку-глазик
        const isPassword = type === "password";
        const resolvedType = isPassword && showPassword ? "text" : type;

        const rightContent = rightSlot !== undefined
            ? rightSlot
            : isPassword
                ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                        className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )
                : null;

        // Паддинг справа: добавляем pr-10, если есть правый слот
        const hasRight = rightContent !== null;
        // Паддинг слева: добавляем pl-9, если есть иконка
        const hasLeft = icon !== undefined;

        return (
            <div className="flex flex-col gap-1.5">
                {/* Метка над полем */}
                {label && <FormLabel htmlFor={fieldId}>{label}</FormLabel>}

                {/* Обёртка для инпута + иконки/кнопки */}
                <div className="relative">
                    {/* Иконка слева */}
                    {hasLeft && (
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={fieldId}
                        type={resolvedType}
                        className={cn(
                            "w-full h-10 rounded-lg border bg-input text-sm text-foreground",
                            "placeholder:text-muted-foreground/40",
                            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
                            "transition-colors",
                            "[&::-webkit-calendar-picker-indicator]:invert",
                            error
                                ? "border-destructive focus:ring-destructive"
                                : "border-border",
                            hasLeft ? "pl-9" : "px-3",
                            hasRight ? "pr-10" : hasLeft ? "pr-3" : "",
                            className,
                        )}
                        {...props}
                    />

                    {/* Слот справа */}
                    {hasRight && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {rightContent}
                        </span>
                    )}
                </div>

                {/* Текст ошибки — показывается только если есть */}
                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}
            </div>
        );
    },
);

FormInput.displayName = "FormInput";