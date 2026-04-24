import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

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

const s = styles.copyButton;

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
      className={s.iconRoot}
    >
      {copied ? (
        <Check size={14} className={s.iconCopied} />
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
  label = "Скопировать ключ",
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
      className={cn(s.blockRoot, copied ? s.blockCopied : s.blockDefault)}
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
