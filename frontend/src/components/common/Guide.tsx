import { useState } from "react";
import {
  ExternalLink,
  MessageCircle,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  WINDOWS_ICON_PATH,
  APPLE_ICON_PATH,
  ANDROID_ICON_PATH,
  LINUX_ICON_PATH,
} from "@/lib/constants";
import { styles } from "@/styles";

// -------------------------------------------------------------
// Иконки платформ
// -------------------------------------------------------------

function IconWindows({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Windows"
    >
      <path d={WINDOWS_ICON_PATH} />
    </svg>
  );
}

function IconApple({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Apple"
    >
      <path d={APPLE_ICON_PATH} />
    </svg>
  );
}

function IconLinux({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-label="Linux"
    >
      <path d={LINUX_ICON_PATH} />
    </svg>
  );
}

function IconAndroid({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-label="Android"
    >
      <path d={ANDROID_ICON_PATH} />
    </svg>
  );
}

// -------------------------------------------------------------
// Данные платформ
// -------------------------------------------------------------

type PlatformId = "windows" | "linux" | "macos" | "ios" | "android";

interface Platform {
  id: PlatformId;
  name: string;
  Icon: React.ComponentType<{ size?: number }>;
  clientName: string;
  clientDescription: string;
  downloadUrl: string;
  downloadLabel: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "ios",
    name: "iPhone",
    Icon: IconApple,
    clientName: "Streisand",
    clientDescription: "Удобный и функциональный клиент для iOS",
    downloadUrl: "https://apps.apple.com/app/streisand/id6450534064",
    downloadLabel: "App Store",
  },
  {
    id: "android",
    name: "Android",
    Icon: IconAndroid,
    clientName: "v2RayTun",
    clientDescription:
      "Поддерживает все современные протоколы, включая Hysteria2",
    downloadUrl:
      "https://play.google.com/store/apps/details?id=com.v2raytun.android",
    downloadLabel: "Google Play",
  },
  {
    id: "macos",
    name: "macOS",
    Icon: IconApple,
    clientName: "Streisand",
    clientDescription: "Родное приложение для macOS из App Store",
    downloadUrl: "https://apps.apple.com/app/streisand/id6450534064",
    downloadLabel: "Mac App Store",
  },
  {
    id: "windows",
    name: "Windows",
    Icon: IconWindows,
    clientName: "Hiddify",
    clientDescription: "Полная поддержка Hysteria2, установщик AppImage / exe",
    downloadUrl: "https://github.com/hiddify/hiddify-next/releases/latest",
    downloadLabel: "GitHub",
  },
  {
    id: "linux",
    name: "Linux",
    Icon: IconLinux,
    clientName: "Hiddify",
    clientDescription: "AppImage / .deb — простота установки",
    downloadUrl: "https://github.com/hiddify/hiddify-next/releases/latest",
    downloadLabel: "GitHub",
  },
];

// -------------------------------------------------------------
// Вспомогательные компоненты
// -------------------------------------------------------------

const s = styles.guide;

/** Строка с иконкой и текстом — всегда выровнены по центру. */
function Row({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(s.row, className)}>
      <span className={s.rowIcon}>{icon}</span>
      <span className={s.rowText}>{children}</span>
    </div>
  );
}

/** Бейдж с иконкой — используется inline в тексте. */
function Badge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className={s.badge}>
      <span className={s.rowIcon}>{icon}</span>
      <span>{children}</span>
    </span>
  );
}

// -------------------------------------------------------------
// Шаг онбординга
// -------------------------------------------------------------

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  last?: boolean;
  children: React.ReactNode;
}

function Step({ number, icon, title, last = false, children }: StepProps) {
  return (
    <div className={s.stepRoot}>
      {/* Номер шага и вертикальная линия */}
      <div className={s.stepAside}>
        <div className={s.stepNumber}>{number}</div>
        {!last && <div className={s.stepLine} />}
      </div>

      {/* Содержимое шага */}
      <div className={cn(last ? s.stepBodyLast : s.stepBody)}>
        <Row
          icon={<span className={s.stepIconWrap}>{icon}</span>}
          className={s.stepTitleRow}
        >
          <span className={s.stepTitle}>{title}</span>
        </Row>
        {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Кнопка выбора платформы
// -------------------------------------------------------------

function PlatformButton({
  platform,
  isSelected,
  onClick,
}: {
  platform: Platform;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        s.platformBtn,
        isSelected ? s.platformBtnSelected : s.platformBtnDefault,
      )}
    >
      <span className={s.platformBtnIcon}>
        <platform.Icon size={20} />
      </span>
      <span className={s.platformBtnLabel}>{platform.name}</span>
    </button>
  );
}

// -------------------------------------------------------------
// Карточка клиента
// -------------------------------------------------------------

function ClientCard({ platform }: { platform: Platform }) {
  return (
    <div className={s.clientCard}>
      <div className={s.clientCardBody}>
        <p className={s.clientName}>{platform.clientName}</p>
        <p className={s.clientDesc}>{platform.clientDescription}</p>
      </div>
      <a
        href={platform.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={s.clientDownloadLink}
      >
        <ExternalLink size={11} className={s.rowIcon} />
        <span>{platform.downloadLabel}</span>
      </a>
    </div>
  );
}

// -------------------------------------------------------------
// Блок с текстом
// -------------------------------------------------------------

function InfoBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(s.infoBlock, className)}>{children}</div>;
}

// -------------------------------------------------------------
// Основной компонент
// -------------------------------------------------------------

export function Guide() {
  const [selectedId, setSelectedId] = useState<PlatformId | null>(null);
  const platform = PLATFORMS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className={s.root}>
      <h2 className={s.guideTitle}>Как начать пользоваться</h2>

      <div className={s.stepsWrap}>
        {/* Шаг 1 — связаться с администратором */}
        <Step
          number={1}
          icon={<MessageCircle size={15} />}
          title="Связаться с администратором"
        >
          <InfoBlock>
            <p>
              Напишите администратору — он активирует аккаунт и сообщит цену
            </p>
            <a
              href="https://t.me/stdoq"
              target="_blank"
              rel="noopener noreferrer"
              className={s.telegramLink}
            >
              <div className={s.telegramAvatar}>
                <MessageCircle size={15} />
              </div>
              <div className={s.telegramBody}>
                <p className={s.telegramName}>@stdoq</p>
                <p className={s.telegramPlatformLabel}>Telegram</p>
              </div>
              <ExternalLink size={13} className={s.telegramExternalIcon} />
            </a>
          </InfoBlock>
        </Step>

        {/* Шаг 2 — установить клиент */}
        <Step
          number={2}
          icon={<Download size={15} />}
          title="Установить клиент"
        >
          <div className={s.platformSection}>
            <p className={s.platformHint}>
              Выберите Вашу платформу — мы подберём подходящее приложение:
            </p>
            <div className={s.platformGrid}>
              <div className={s.platformRow3}>
                {PLATFORMS.slice(0, 3).map((p) => (
                  <PlatformButton
                    key={p.id}
                    platform={p}
                    isSelected={selectedId === p.id}
                    onClick={() =>
                      setSelectedId((prev) => (prev === p.id ? null : p.id))
                    }
                  />
                ))}
              </div>
              <div className={s.platformRow2}>
                {PLATFORMS.slice(3).map((p) => (
                  <PlatformButton
                    key={p.id}
                    platform={p}
                    isSelected={selectedId === p.id}
                    onClick={() =>
                      setSelectedId((prev) => (prev === p.id ? null : p.id))
                    }
                  />
                ))}
              </div>
            </div>
            {platform && <ClientCard platform={platform} />}
          </div>
        </Step>

        {/* Шаг 3 — получить ключ */}
        {platform && (
          <Step number={3} icon={<Copy size={15} />} title="Скопировать ключ">
            <InfoBlock>
              <p>
                Ключ подключения — это адрес сервера и Ваши данные доступа,
                упакованные в одну строку.
              </p>
              <div className={s.infoSeparator} />
              <p>
                На странице профиля выберите{" "}
                <strong className="text-foreground">сервер</strong> из списка
                доступных — каждый сервер имеет свой ключ.
              </p>
              <p className="flex flex-wrap items-center gap-1.5">
                После выбора нажмите{" "}
                <Badge icon={<Copy size={11} />}>Скопировать ключ</Badge>.
              </p>
            </InfoBlock>
          </Step>
        )}

        {/* Шаг 4 — открыть приложение */}
        {platform && (
          <Step
            number={4}
            icon={<Plus size={15} />}
            title={`Открыть ${platform.clientName}`}
          >
            <InfoBlock>
              <p className="flex flex-wrap items-center gap-1.5">
                Откройте{" "}
                <strong className="text-foreground">
                  {platform.clientName}
                </strong>
                . Найдите кнопку{" "}
                <span className={s.plusBadge}>
                  <Plus size={11} strokeWidth={2.5} />
                </span>{" "}
                — обычно она находится вверху экрана.
              </p>
              <p>Эта кнопка открывает меню добавления нового подключения.</p>
            </InfoBlock>
          </Step>
        )}

        {/* Шаг 5 — импортировать конфигурацию */}
        {platform && (
          <Step
            number={5}
            icon={<Download size={15} />}
            title="Импортировать конфигурацию"
          >
            <InfoBlock>
              <p className="flex flex-wrap items-center gap-1.5">
                В открывшемся меню выберите{" "}
                <Badge icon={null}>Импорт из буфера обмена</Badge>
              </p>
              <div className={s.infoSeparator} />
              <p>
                Приложение само прочитает скопированный ключ и создаст профиль —
                вам ничего вводить вручную не нужно. Профиль появится в списке подключений (иногда его надо развернуть).
              </p>
                
            </InfoBlock>
          </Step>
        )}

        {/* Шаг 6 — подключиться */}
        {platform && (
          <Step
            number={6}
            icon={<CheckCircle2 size={15} />}
            title="Подключиться"
            last
          >
            <div className={s.successBlock}>
              <Row
                icon={
                  <div className={s.successAvatar}>
                    <CheckCircle2 size={15} />
                  </div>
                }
              >
                <span className={s.successTitle}>Готово!</span>
              </Row>
              <p className={s.successDesc}>
                Выберите созданный профиль и включите соединение — интернет без
                ограничений.
              </p>
            </div>
          </Step>
        )}
      </div>
    </div>
  );
}
