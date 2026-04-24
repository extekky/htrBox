import { useState } from "react";
import {
  BookOpen,
  CreditCard,
  Shield,
  MessageCircle,
  ChevronDown,
  Send,
  Info,
  KeyRound,
  Clock,
  Server,
  Activity,
  Lock,
  Download,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { styles } from "@/styles";

const s = styles.manualPage;

// -------------------------------------------------------------
// Тип акцентного цвета — используется для иконок секций
// -------------------------------------------------------------

type Accent = "primary" | "emerald" | "amber" | "rose";

// -------------------------------------------------------------
// Сворачиваемая секция (аккордеон)
// -------------------------------------------------------------

interface SectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  accent?: Accent;
  /** Открыта ли секция по умолчанию */
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({
  id,
  icon,
  title,
  accent = "primary",
  defaultOpen = false,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Палитра акцентов для иконок
  const accentMap: Record<Accent, string> = {
    primary: s.sectionAccentPrimary,
    emerald: s.sectionAccentEmerald,
    amber: s.sectionAccentAmber,
    rose: s.sectionAccentRose,
  };

  return (
    <Card
      className={cn(
        s.sectionCard,
        // Слегка приглушаем рамку, когда секция закрыта
        !open && s.sectionCardClosed,
      )}
    >
      {/* Кнопка-заголовок секции */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={s.sectionButton}
        aria-expanded={open}
        aria-controls={`sec-${id}`}
      >
        <div className={s.sectionHead}>
          {/* Иконка с акцентным фоном */}
          <span className={cn(s.sectionAccentBase, accentMap[accent])}>
            {icon}
          </span>
          <span className={s.sectionTitle}>{title}</span>
        </div>

        {/* Стрелка — разворачивается при открытии */}
        <ChevronDown
          size={15}
          className={cn(s.sectionChevron, open && s.sectionChevronOpen)}
        />
      </button>

      {/* Тело секции — видимо только в открытом состоянии */}
      {open && (
        <div id={`sec-${id}`} className={s.sectionBody}>
          {children}
        </div>
      )}
    </Card>
  );
}

// -------------------------------------------------------------
// Карточка статуса аккаунта (активен / неактивен / нейтральный)
// Цветовая схема совпадает с бейджами на странице профиля
// -------------------------------------------------------------

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: "emerald" | "amber" | "muted";
}

function StatusCard({ icon, label, description, color }: StatusCardProps) {
  // Цветовые токены для каждого состояния
  const palette = {
    emerald: {
      wrap: s.statusSuccessWrap,
      icon: s.statusSuccessIcon,
      label: s.statusSuccessLabel,
    },
    amber: {
      wrap: s.statusWarningWrap,
      icon: s.statusWarningIcon,
      label: s.statusWarningLabel,
    },
    muted: {
      wrap: s.statusMutedWrap,
      icon: s.statusMutedIcon,
      label: s.statusMutedLabel,
    },
  };

  const p = palette[color];

  return (
    <div className={cn(s.statusCard, p.wrap)}>
      <span className={cn(s.statusIcon, p.icon)}>{icon}</span>
      <div>
        <p className={cn(s.statusLabel, p.label)}>{label}</p>
        <p className={s.statusDescription}>{description}</p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Карточка правила — три визуальных варианта: обычный / предупреждение / запрет
// -------------------------------------------------------------

function RuleCard({
  icon,
  text,
  variant = "default",
}: {
  icon: React.ReactNode;
  text: string;
  variant?: "default" | "warning" | "danger";
}) {
  return (
    <div
      className={cn(
        s.ruleCard,
        variant === "warning" && s.ruleWarningWrap,
        variant === "danger" && s.ruleDangerWrap,
        variant === "default" && s.ruleDefaultWrap,
      )}
    >
      {/* Иконка с цветом под вариант */}
      <span
        className={cn(
          s.ruleIcon,
          variant === "warning" && s.ruleWarningIcon,
          variant === "danger" && s.ruleDangerIcon,
          variant === "default" && s.ruleDefaultIcon,
        )}
      >
        {icon}
      </span>

      {/* Текст правила */}
      <span
        className={cn(
          s.ruleText,
          variant === "warning" && s.ruleWarningText,
          variant === "danger" && s.ruleDangerText,
          variant === "default" && s.ruleDefaultText,
        )}
      >
        {text}
      </span>
    </div>
  );
}

// -------------------------------------------------------------
// Информационная заметка — нейтральная или с акцентом «внимание»
// -------------------------------------------------------------

function Note({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "amber";
}) {
  const isAmber = variant === "amber";

  return (
    <div
      className={cn(s.note, isAmber ? s.noteWarningWrap : s.noteDefaultWrap)}
    >
      <Info
        size={13}
        className={cn(
          s.noteIcon,
          isAmber ? s.noteWarningIcon : s.noteDefaultIcon,
        )}
      />
      <span>{children}</span>
    </div>
  );
}

// -------------------------------------------------------------
// Главная страница — «Правила и справка»
// -------------------------------------------------------------

export function ManualPage() {
  return (
    <AppShell>
      <div className={s.root}>
        <div className={s.inner}>
          {/* -- Заголовок страницы -- */}
          <div>
            <h1 className={s.title}>Правила и справка</h1>
            <p className={s.subtitle}>Всё о сервисе, тарифах и ограничениях</p>
          </div>

          {/* -- Список секций -- */}
          <div className={s.sections}>
            {/* -------------------------------------------------------------
                            1. Как устроен сервис
                        ------------------------------------------------------------- */}
            <Section
              id="about"
              icon={<BookOpen size={15} />}
              title="Как устроен сервис"
              accent="primary"
              defaultOpen
            >
              <div className={s.sectionInner}>
                {/* Краткое описание */}
                <p className={s.textMuted}>
                  <strong className={s.textStrong}>HtrBox</strong> — личный
                  кабинет для VPN на основе{" "}
                  <strong className={s.textStrong}>Hysteria2</strong>. Трафик
                  маскируется под HTTPS — соединение устойчиво к блокировкам.
                </p>

                {/* Плитка возможностей (2×2) */}
                <div className={s.aboutTiles}>
                  {[
                    {
                      icon: <KeyRound size={14} />,
                      label: "Уникальная ссылка подключения",
                    },
                    {
                      icon: <Activity size={14} />,
                      label: "Статистика трафика",
                    },
                    {
                      icon: <Clock size={14} />,
                      label: "Дата истечения подписки",
                    },
                    { icon: <Server size={14} />, label: "Выбор сервера" },
                  ].map((item) => (
                    <div key={item.label} className={s.aboutTile}>
                      <span className={s.aboutTileIcon}>{item.icon}</span>
                      <span className={s.aboutTileText}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <Note>
                  Аккаунт создаётся при регистрации. Администратор активирует
                  доступ после оплаты.
                </Note>
              </div>
            </Section>

            {/* -------------------------------------------------------------
                            2. Статус аккаунта
                        ------------------------------------------------------------- */}
            <Section
              id="status"
              icon={<Activity size={15} />}
              title="Статус аккаунта"
              accent="emerald"
            >
              <div className={s.sectionInner}>
                <p className={s.textMuted}>
                  Статус показывает, работает ли ваша VPN-ссылка прямо сейчас.
                </p>

                {/* Карточки двух состояний */}
                <StatusCard
                  icon={<CheckCircle2 size={16} />}
                  label="Активен"
                  description="Подписка оплачена и активирована. VPN-ссылка работает."
                  color="emerald"
                />
                <StatusCard
                  icon={<XCircle size={16} />}
                  label="Неактивен"
                  description="Срок действия подписки закончился или не установлен. Свяжитесь с поддержкой и оплатите подписку."
                  color="amber"
                />

                <Note>
                  Активация после оплаты — обычно в течение нескольких часов.
                </Note>
              </div>
            </Section>

            {/* -------------------------------------------------------------
                            3. Правила использования
                        ------------------------------------------------------------- */}
            <Section
              id="rules"
              icon={<Shield size={15} />}
              title="Правила использования"
              accent="rose"
            >
              <div className={s.sectionInnerRules}>
                {/* default — просто рекомендация */}
                <RuleCard
                  icon={<Lock size={14} />}
                  text="Не передавайте ссылку подключения третьим лицам — она привязана к вашему аккаунту."
                />
                {/* warning — ограничение трафика */}
                <RuleCard
                  icon={<Download size={14} />}
                  text="Лимит трафика — не ограничен, но цветовая индикация в профиле ориентирована на 10 Гб."
                  variant="warning"
                />
                {/* danger — запрет */}
                <RuleCard
                  icon={<AlertTriangle size={14} />}
                  text="Если будет зафиксировано 3 и более одновременных подключений с одного аккаунта - бан."
                  variant="danger"
                />
                <RuleCard
                  icon={<ArrowRightLeft size={14} />}
                  text="При смене устройства скопируйте ссылку и вставьте в клиент заново."
                />
                <RuleCard
                  icon={<KeyRound size={14} />}
                  text="Не сообщайте пароль от личного кабинета — он нужен только вам."
                />
              </div>
            </Section>

            {/* -------------------------------------------------------------
                            4. Оплата
                        ------------------------------------------------------------- */}
            <Section
              id="payment"
              icon={<CreditCard size={15} />}
              title="Оплата"
              accent="emerald"
            >
              <div className={s.sectionInner}>
                {/* Карточки тарифов (сейчас только «Базовый») */}
                <div className={s.paymentGrid}>
                  {/* Базовый тариф */}
                  <div className={s.paymentPlanCard}>
                    {/* Метка тарифа */}
                    <div className={s.paymentPlanHeader}>
                      <Zap size={13} className={s.paymentPlanIcon} />
                      <span className={s.paymentPlanTitle}>Базовый</span>
                    </div>

                    {/* Цена */}
                    <div className={s.paymentPrice}>
                      <span className={s.paymentPriceValue}>200</span>
                      <span className={s.paymentPriceUnit}>₽ / мес</span>
                    </div>

                    {/* Фичи тарифа */}
                    <div className={s.paymentFeatures}>
                      {[
                        "Hysteria2 протокол",
                        "До 10 ГБ трафика",
                        "2 устройства",
                      ].map((feature) => (
                        <div key={feature} className={s.paymentFeature}>
                          <CheckCircle2
                            size={11}
                            className={s.paymentFeatureIcon}
                          />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Инструкция по оплате */}
                <div className={s.paymentHelp}>
                  <MessageCircle size={15} className={s.paymentHelpIcon} />
                  <div>
                    <p className={s.paymentHelpTitle}>Как оплатить</p>
                    <p className={s.paymentHelpText}>
                      Оплата прямым переводом на карту. Реквизиты — в поддержке.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* -------------------------------------------------------------
                            5. Поддержка
                ------------------------------------------------------------- */}
            <Section
              id="support"
              icon={<MessageCircle size={15} />}
              title="Поддержка"
              accent="primary"
            >
              <div className={s.sectionInner}>
                <p className={s.textMuted}>
                  Вопросы по подключению, оплате или аккаунту — пишите напрямую:
                </p>

                {/* Кнопка-ссылка на Telegram */}
                <a
                  href="https://t.me/stdoq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.supportLink}
                >
                  <Send size={14} />
                  @stdoq
                </a>

                <Note variant="amber">
                  Ответ в течение дня. Укажите ваш логин при обращении — это
                  ускорит ответ.
                </Note>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
