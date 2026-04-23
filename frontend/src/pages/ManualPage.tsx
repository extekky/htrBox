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

// -------------------------------------------------------------
// Тип акцентного цвета — используется для иконок секций
// -------------------------------------------------------------

type Accent = "primary" | "emerald" | "amber" | "blue" | "rose";

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
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    rose: "bg-rose-500/10 text-rose-500",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors duration-200",
        // Слегка приглушаем рамку, когда секция закрыта
        !open && "border-border/60 hover:border-border",
      )}
    >
      {/* Кнопка-заголовок секции */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors text-left"
        aria-expanded={open}
        aria-controls={`sec-${id}`}
      >
        <div className="flex items-center gap-3">
          {/* Иконка с акцентным фоном */}
          <span
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-xl shrink-0",
              accentMap[accent],
            )}
          >
            {icon}
          </span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>

        {/* Стрелка — разворачивается при открытии */}
        <ChevronDown
          size={15}
          className={cn(
            "text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Тело секции — видимо только в открытом состоянии */}
      {open && (
        <div
          id={`sec-${id}`}
          className="px-5 pb-5 pt-1 border-t border-border/60 text-sm text-foreground leading-relaxed"
        >
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
      wrap: "bg-emerald-500/10 border-emerald-500/20",
      icon: "text-emerald-500",
      label: "text-emerald-500",
    },
    amber: {
      wrap: "bg-amber-500/10 border-amber-500/20",
      icon: "text-amber-500",
      label: "text-amber-500",
    },
    muted: {
      wrap: "bg-secondary/70 border-border",
      icon: "text-muted-foreground",
      label: "text-foreground",
    },
  };

  const p = palette[color];

  return (
    <div
      className={cn("flex items-center gap-3 p-4 rounded-xl border", p.wrap)}
    >
      <span className={cn("shrink-0 mt-0.5", p.icon)}>{icon}</span>
      <div>
        <p className={cn("text-sm font-semibold", p.label)}>{label}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
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
        "flex gap-3 p-3 rounded-xl border items-center",
        // /8 -> /10 чтобы совпадать с bg-amber-500/10 из getAccountStatus
        variant === "warning" && "bg-amber-500/10 border-amber-500/20",
        variant === "danger" && "bg-red-500/10 border-red-500/20",
        variant === "default" && "bg-secondary/70 border-border",
      )}
    >
      {/* Иконка с цветом под вариант */}
      <span
        className={cn(
          "shrink-0 mt-0.5",
          variant === "warning" && "text-amber-500",
          variant === "danger" && "text-red-500",
          variant === "default" && "text-primary",
        )}
      >
        {icon}
      </span>

      {/* Текст правила */}
      <span
        className={cn(
          "text-sm leading-relaxed",
          // text-amber-500 / text-red-500 — те же что в getAccountStatus
          variant === "warning" && "text-amber-500",
          variant === "danger" && "text-red-500",
          variant === "default" && "text-muted-foreground",
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
      className={cn(
        "flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs",
        isAmber
          ? // bg-amber-500/8 -> /10, text совпадает с Warning-баннером ProfilePage
            "bg-amber-500/10 border-amber-500/20 text-amber-500"
          : "bg-muted/40 border-border/60 text-muted-foreground",
      )}
    >
      <Info
        size={13}
        className={cn(
          "shrink-0 mt-0.5",
          isAmber ? "text-amber-500" : "text-muted-foreground",
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
      <div className="flex justify-center py-8 px-4">
        <div className="w-full max-w-150 flex flex-col gap-4 animate-fade-in">
          {/* -- Заголовок страницы -- */}
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Правила и справка
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Всё о сервисе, тарифах и ограничениях
            </p>
          </div>

          {/* -- Список секций -- */}
          <div className="flex flex-col gap-3">
            {/* -------------------------------------------------------------
                            1. Как устроен сервис
                        ------------------------------------------------------------- */}
            <Section
              id="about"
              icon={<BookOpen size={15} />}
              title="Как устроен сервис"
              accent="blue"
              defaultOpen
            >
              <div className="flex flex-col gap-3 pt-3">
                {/* Краткое описание */}
                <p className="text-muted-foreground">
                  <strong className="text-foreground">htrBox</strong> — личный
                  кабинет для VPN на основе{" "}
                  <strong className="text-foreground">Hysteria2</strong>. Трафик
                  маскируется под HTTPS — соединение устойчиво к блокировкам.
                </p>

                {/* Плитка возможностей (2×2) */}
                <div className="grid grid-cols-2 gap-2">
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
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50"
                    >
                      <span className="text-primary shrink-0">{item.icon}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
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
              <div className="flex flex-col gap-3 pt-3">
                <p className="text-muted-foreground">
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
              <div className="flex flex-col gap-2.5 pt-3">
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
              <div className="flex flex-col gap-3 pt-3">
                {/* Карточки тарифов (сейчас только «Базовый») */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Базовый тариф */}
                  <div className="flex flex-col gap-3 p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl">
                    {/* Метка тарифа */}
                    <div className="flex items-center gap-2">
                      <Zap size={13} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                        Базовый
                      </span>
                    </div>

                    {/* Цена */}
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-foreground leading-none">
                        200
                      </span>
                      <span className="text-sm text-muted-foreground mb-0.5">
                        ₽ / мес
                      </span>
                    </div>

                    {/* Фичи тарифа */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-emerald-500/15">
                      {[
                        "Hysteria2 протокол",
                        "До 10 ГБ трафика",
                        "2 устройства",
                      ].map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2
                            size={11}
                            className="text-emerald-500 shrink-0"
                          />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/*
                                        Тариф «Plus» — скрыт до запуска
                                        Раскомментировать, когда будет готов
                                    */}
                </div>

                {/* Инструкция по оплате */}
                <div className="flex gap-3 p-4 rounded-xl bg-secondary/70 border border-border items-center">
                  <MessageCircle
                    size={15}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Как оплатить
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
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
              <div className="flex flex-col gap-3 pt-3">
                <p className="text-muted-foreground">
                  Вопросы по подключению, оплате или аккаунту — пишите напрямую:
                </p>

                {/* Кнопка-ссылка на Telegram */}
                <a
                  href="https://t.me/stdoq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
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
