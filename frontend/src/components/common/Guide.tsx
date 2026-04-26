import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
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
  importAction: string;
  connectAction: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "ios",
    name: "iPhone",
    Icon: IconApple,
    clientName: "Streisand",
    clientDescription: "Стабильный клиент для iOS с простым импортом из буфера",
    downloadUrl: "https://apps.apple.com/app/streisand/id6450534064",
    downloadLabel: "App Store",
    importAction: "Import from Clipboard",
    connectAction: "Откройте профиль и включите VPN",
  },
  {
    id: "android",
    name: "Android",
    Icon: IconAndroid,
    clientName: "v2RayTun",
    clientDescription: "Поддерживает Hysteria2, импорт одним нажатием",
    downloadUrl:
      "https://play.google.com/store/apps/details?id=com.v2raytun.android",
    downloadLabel: "Google Play",
    importAction: "Импорт из буфера обмена",
    connectAction: "Выберите профиль и нажмите Connect",
  },
  {
    id: "macos",
    name: "macOS",
    Icon: IconApple,
    clientName: "Streisand",
    clientDescription: "Нативное приложение из App Store для macOS",
    downloadUrl: "https://apps.apple.com/app/streisand/id6450534064",
    downloadLabel: "Mac App Store",
    importAction: "Import from Clipboard",
    connectAction: "Активируйте профиль в списке подключений",
  },
  {
    id: "windows",
    name: "Windows",
    Icon: IconWindows,
    clientName: "Hiddify",
    clientDescription: "Полная поддержка Hysteria2, быстрая настройка на ПК",
    downloadUrl: "https://github.com/hiddify/hiddify-next/releases/latest",
    downloadLabel: "GitHub",
    importAction: "Add Profile > From Clipboard",
    connectAction: "Включите профиль кнопкой подключения",
  },
  {
    id: "linux",
    name: "Linux",
    Icon: IconLinux,
    clientName: "Hiddify",
    clientDescription: "AppImage/.deb с поддержкой Hysteria2",
    downloadUrl: "https://github.com/hiddify/hiddify-next/releases/latest",
    downloadLabel: "GitHub",
    importAction: "Add Profile > From Clipboard",
    connectAction: "Выберите профиль и запустите соединение",
  },
];

// -------------------------------------------------------------
// Вспомогательные компоненты
// -------------------------------------------------------------

const s = styles.guide;

/** Строка с иконкой и текстом — единая типографика по гайду. */
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
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className={s.badge}>
      {icon ? <span className={s.rowIcon}>{icon}</span> : null}
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
  hint?: string;
  last?: boolean;
  children: React.ReactNode;
}

function Step({
  number,
  icon,
  title,
  hint,
  last = false,
  children,
}: StepProps) {
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

        {hint ? <p className={s.stepHint}>{hint}</p> : null}
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
      <div className={s.clientCardPrimary}>
        <p className={s.clientName}>{platform.clientName}</p>
        <a
          href={platform.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={s.clientDownloadButton}
        >
          <span>Скачать из {platform.downloadLabel}</span>
          <ExternalLink size={12} className={s.rowIcon} />
        </a>
      </div>
      <p className={s.clientDesc}>{platform.clientDescription}</p>
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
      <h2 className={s.guideTitle}>Пошаговая настройка VPN</h2>

      <div className={s.stepsWrap}>
        {/* Шаг 1 — связаться с администратором */}
        <Step
          number={1}
          icon={<MessageCircle size={15} />}
          title="Активировать аккаунт"
          hint="Без активации VPN-ссылка не будет работать."
        >
          <InfoBlock>
            <p className={s.infoText}>
              Напишите администратору — он активирует аккаунт и сообщит цену.
              При обращении укажите имя пользователя.
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
          title="Установить VPN-клиент"
          hint="Выберите платформу, и мы покажем рекомендуемое приложение."
        >
          <div className={s.platformSection}>
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
            {platform ? <ClientCard platform={platform} /> : null}
          </div>
        </Step>

        {platform ? (
          <>
            {/* Шаг 3 — получить ключ */}
            <Step
              number={3}
              icon={<Copy size={15} />}
              title="Скопировать ключ из профиля"
              hint="Ключ содержит адрес сервера и ваши данные доступа."
            >
              <InfoBlock>
                <p className={s.infoText}>
                  Bыберите сервер, нажмите кнопку{" "}
                  <Badge icon={<Copy size={11} />}>Скопировать ключ</Badge>
                </p>
                <div className={s.infoSeparator} />
                <ul className={s.infoList}>
                  <li className={s.infoListItem}>
                    Не редактируйте ключ вручную.
                  </li>
                  <li className={s.infoListItem}>
                    Если сменили сервер, скопируйте ключ заново.
                  </li>
                </ul>
              </InfoBlock>
            </Step>

            {/* Шаг 4 — импортировать конфигурацию */}
            <Step
              number={4}
              icon={<Plus size={15} />}
              title="Импортировать ключ в клиент"
              hint="В большинстве приложений это делается через кнопку добавления профиля."
            >
              <InfoBlock>
                <p className={s.infoText}>
                  Откройте{" "}
                  <span className={s.stepKey}>{platform.clientName}</span> и
                  выберите <Badge>{platform.importAction}</Badge>
                </p>
                <div className={s.infoSeparator} />
                <p className={s.infoText}>
                  Приложение автоматически создаст профиль из скопированного
                  ключа. Разверните список, если профиль не видно (неочевидный
                  UI клиента).
                </p>
              </InfoBlock>
            </Step>

            {/* Шаг 5 — подключиться */}
            <Step
              number={5}
              icon={<CheckCircle2 size={15} />}
              title="Включить VPN и проверить"
              hint="После подключения интернет должен работать стабильно без ограничений."
            >
              <InfoBlock>
                <p className={s.infoText}>{platform.connectAction}</p>
                <div className={s.infoSeparator} />
                <ul className={s.infoList}>
                  <li className={s.infoListItem}>
                    Проверьте, что статус соединения активен.
                  </li>
                  <li className={s.infoListItem}>
                    Откройте сайт или видео для быстрой проверки.
                  </li>
                </ul>
                <p className={s.successRow}>
                  Если всё подключилось — настройка завершена.
                </p>
              </InfoBlock>
            </Step>

            {/* Шаг 6 — диагностика */}
            <Step
              number={6}
              icon={<AlertTriangle size={15} />}
              title="Если не подключается"
              hint="Ниже самые частые причины и как их быстро проверить."
              last
            >
              <InfoBlock>
                <ul className={s.infoList}>
                  <li className={s.infoListItem}>
                    Перекопируйте ключ в профиле и импортируйте заново.
                  </li>
                  <li className={s.infoListItem}>
                    Проверьте, что аккаунт активен и выбран рабочий сервер.
                  </li>
                  <li className={s.infoListItem}>
                    Перезапустите клиент и попробуйте подключиться снова.
                  </li>
                </ul>
              </InfoBlock>
            </Step>
          </>
        ) : null}
      </div>
    </div>
  );
}
