/**
 * FormInput — универсальное поле формы с меткой, инпутом и ошибкой.
 *
 *  Возможности:
 *   - кнопки «показать/скрыть пароль» для type="password"
 *   - иконки слева через проп `icon`
 *   - кастомного правого слота через `rightSlot`
 *   - специальное визуальное выделение пустых datetime-local полей
 */

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FormLabel } from "@/components/ui/FormLabel";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Текст метки над полем. Если не передан — лейбл не рендерится. */
  label?: string;
  /** Сообщение об ошибке валидации. Подсвечивает рамку красным. */
  error?: string;
  /** Иконка слева внутри поля (необязательно). */
  icon?: React.ReactNode;
  /** Произвольный слот справа внутри поля (переопределяет глазик у пароля). */
  rightSlot?: React.ReactNode;
}

const s = styles.formInput;

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, type, icon, rightSlot, className, ...props }, ref) => {
    // Состояние видимости для полей пароля
    const [showPassword, setShowPassword] = useState(false);

    const fieldId =
      id ??
      (label
        ? label.toLowerCase().replace(/\s+/g, "-")
        : Math.random().toString(36).slice(2));

    // Для добавляем кнопку-глазик
    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

    const hasLeft = icon !== undefined;
    const hasRight = rightSlot !== undefined || isPassword;

    const rightContent =
      rightSlot !== undefined ? (
        rightSlot
      ) : isPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={-1}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          className={s.eyeBtn}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      ) : null;

    const padVariant =
      hasLeft && hasRight
        ? s.inputPadBoth
        : hasLeft
          ? s.inputPadLeft
          : hasRight
            ? s.inputPadRight
            : s.inputPadDefault;

    return (
      <div className={s.root}>
        {label && <FormLabel htmlFor={fieldId}>{label}</FormLabel>}

        <div className={s.inputWrap}>
          {hasLeft && <span className={s.iconLeft}>{icon}</span>}

          <input
            ref={ref}
            id={fieldId}
            type={resolvedType}
            className={cn(
              s.input,
              error ? s.inputError : s.inputDefault,
              padVariant,
              className,
            )}
            {...props}
          />

          {hasRight && <span className={s.iconRight}>{rightContent}</span>}
        </div>

        {error && <p className={s.errorText}>{error}</p>}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
