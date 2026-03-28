import { useState } from "react";
import { Copy, Check } from "lucide-react";

const RESET_DELAY_MS = 1000;

// -------------------------------------------------------------
// Вспомогательная функция для работы с буфером обмена
// Предоставляет запасной вариант для старых окружений.
// -------------------------------------------------------------

/**
 * Копирует предоставленный текст в буфер обмена.
 * Использует Clipboard API, если доступно, иначе — запасной вариант с textarea.
 *
 * @param {string} text - Текст для копирования.
 * @returns {Promise<void>} Промис, который разрешается после копирования текста.
 */
async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
        return;
    } catch {
        // Запасной вариант для окружений без Clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute(
            "style",
            "position:fixed;opacity:0;pointer-events:none;",
        );
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }
}

// -------------------------------------------------------------
// Общие свойства кнопки копирования
// -------------------------------------------------------------

interface BaseCopyButtonProps {
    /** Текст, который будет скопирован в буфер обмена. */
    text: string;
    /** Опциональная функция обратного вызова, вызываемая после успешного копирования. */
    onCopied?: () => void;
    /** Определяет, отключена ли кнопка. */
    disabled?: boolean;
}

// -------------------------------------------------------------
// Вариант "icon" — компактная кнопка с иконкой
// -------------------------------------------------------------

interface IconCopyButtonProps extends BaseCopyButtonProps {
    /** Вариант отображения кнопки. По умолчанию "icon". */
    variant?: "icon";
}

/**
 * Компонент `IconCopyButton` представляет собой компактную кнопку с иконкой для копирования текста.
 *
 * @param {IconCopyButtonProps} props - Свойства компонента.
 * @param {string} props.text - Текст для копирования.
 * @param {() => void} [props.onCopied] - Обработчик после копирования.
 * @param {boolean} [props.disabled=false] - Состояние отключения кнопки.
 */
function IconCopyButton({
    text,
    onCopied,
    disabled = false,
}: IconCopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        if (copied || disabled) return;

        await copyToClipboard(text);
        setCopied(true);
        onCopied?.();
        setTimeout(() => setCopied(false), RESET_DELAY_MS);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            aria-label={copied ? "Скопировано" : "Копировать в буфер обмена"}
            title={copied ? "Скопировано!" : "Копировать"}
            className={`
        p-1.5 rounded-md transition-colors
        text-muted-foreground hover:text-foreground hover:bg-secondary/80
        focus:outline-none focus:ring-2 focus:ring-primary/40
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
        >
            {copied ? (
                <Check size={14} className="text-primary" />
            ) : (
                <Copy size={14} />
            )}
        </button>
    );
}

// -------------------------------------------------------------
// Вариант "block" — заметная кнопка на всю ширину
// -------------------------------------------------------------

interface BlockCopyButtonProps extends BaseCopyButtonProps {
    /** Вариант отображения кнопки. Должен быть "block". */
    variant: "block";
    /** Текст метки кнопки. По умолчанию "Copy". */
    label?: string;
}

/**
 * Компонент `BlockCopyButton` представляет собой заметную кнопку копирования на всю ширину.
 *
 * @param {BlockCopyButtonProps} props - Свойства компонента.
 * @param {string} props.text - Текст для копирования.
 * @param {string} [props.label="Copy"] - Текст метки кнопки.
 * @param {() => void} [props.onCopied] - Обработчик после копирования.
 * @param {boolean} [props.disabled=false] - Состояние отключения кнопки.
 */
function BlockCopyButton({
    text,
    label = "Копировать",
    onCopied,
    disabled = false,
}: BlockCopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        if (copied || disabled) return;

        await copyToClipboard(text);
        setCopied(true);
        onCopied?.();
        setTimeout(() => setCopied(false), RESET_DELAY_MS);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            aria-label={copied ? "Скопировано" : label}
            className={`
        flex w-full items-center justify-center gap-2.5
        rounded-xl border px-5 py-3.5 text-sm font-medium
        transition-all duration-150 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${copied
                    ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                    : "border-primary/40 bg-primary/20 text-primary hover:bg-primary/28"
                }
      `}
        >
            {copied ? (
                <>
                    <Check size={16} />
                    Скопировано!
                </>
            ) : (
                <>
                    <Copy size={16} />
                    {label}
                </>
            )}
        </button>
    );
}

// -------------------------------------------------------------
// Унифицированный компонент CopyButton
// Использует дискриминированное объединение для выбора варианта.
// -------------------------------------------------------------

export type CopyButtonProps = IconCopyButtonProps | BlockCopyButtonProps;

/**
 * Унифицированный компонент `CopyButton`, который отображает кнопку копирования
 * в одном из двух вариантов: "icon" (компактная иконка) или "block" (полноширинная кнопка).
 * Выбор варианта осуществляется через свойство `variant`.
 *
 * @param {CopyButtonProps} props - Свойства компонента, определяющие его тип и поведение.
 */
export function CopyButton(props: CopyButtonProps) {
    if (props.variant === "block") {
        return <BlockCopyButton {...props} />;
    }
    return <IconCopyButton {...props} />;
}
