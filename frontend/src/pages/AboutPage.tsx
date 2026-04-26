import {
  CreditCard,
  ShieldCheck,
  Server,
  Wrench,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { styles } from "@/styles";

const s = styles.aboutPage;

const paymentReasons = [
  "аренда и обслуживание серверов в разных странах",
  "оплата трафика, мониторинга и базовой инфраструктуры",
  "поддержка пользователей, помощь с подключением и обновления сервиса",
];

const serviceIncludes = [
  "доступ к личному кабинету и вашей VPN-ссылке",
  "управление подпиской, сервером и статусом аккаунта",
  "статистика трафика и базовая техническая поддержка",
];

export function AboutPage() {
  return (
    <AppShell>
      <div className={s.root}>
        <div className={s.inner}>
          <div>
            <h1 className={s.title}>О сервисе</h1>
            <p className={s.subtitle}>
              Кто делает проект, для чего он создан и за что берётся оплата
            </p>
          </div>

          <Card className={s.heroCard}>
            <span className={s.heroBadge}>Прозрачно о проекте</span>
            <p className={s.heroText}>
              <strong>HtrBox</strong> это личный кабинет для VPN на основе
              протокола <strong>Hysteria2</strong>. Проект сделан для того,
              чтобы у пользователей был простой способ получить доступ к
              серверу, выбрать локацию, видеть статус подписки и пользоваться
              подключением без ручной настройки на каждом шаге.
            </p>
          </Card>

          <div className={s.grid}>
            <Card className={s.sectionCard}>
              <div className={s.sectionHead}>
                <span className={s.sectionIconWrap}>
                  <Wrench size={16} />
                </span>
                <h2 className={s.sectionTitle}>Кто разрабатывает сервис</h2>
              </div>
              <p className={s.sectionText}>
                Разработка и поддержка проекта ведется одним разработчиком{" "}
                <strong>Стасом</strong>. Связь и поддержка доступны через
                Telegram: <strong>@stdoq</strong>.
              </p>
              <p className={s.sectionText}>
                Если вы пользуетесь сервисом, то наврняка знакомы со мной лично
                :)
              </p>
            </Card>

            <Card className={s.sectionCard}>
              <div className={s.sectionHead}>
                <span className={s.sectionIconWrap}>
                  <ShieldCheck size={16} />
                </span>
                <h2 className={s.sectionTitle}>Для чего сделан проект</h2>
              </div>
              <p className={s.sectionText}>
                Задача — дать доступ к серверам с Hysteria2 в разных странах и
                сделать это максимально просто для пользователя. Сервис
                позволяет подключаться к VPN без сложной ручной настройки, а
                также управлять своей подпиской и сервером через удобный
                интерфейс.
              </p>
              <p className={s.sectionText}>
                Для пользователя это означает меньше ручных действий, а для
                администратора удобное управление инфраструктурой и аккаунтами.
              </p>
            </Card>

            <Card className={s.sectionCard}>
              <div className={s.sectionHead}>
                <span className={s.sectionIconWrap}>
                  <CreditCard size={16} />
                </span>
                <h2 className={s.sectionTitle}>За что берётся оплата</h2>
              </div>
              <div className={s.bulletList}>
                {paymentReasons.map((item) => (
                  <div key={item} className={s.bulletItem}>
                    <CheckCircle2 size={14} className={s.bulletIcon} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={s.sectionCard}>
              <div className={s.sectionHead}>
                <span className={s.sectionIconWrap}>
                  <Server size={16} />
                </span>
                <h2 className={s.sectionTitle}>Что входит в сервис</h2>
              </div>
              <div className={s.bulletList}>
                {serviceIncludes.map((item) => (
                  <div key={item} className={s.bulletItem}>
                    <CheckCircle2 size={14} className={s.bulletIcon} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className={s.perkCard}>
            <div className={s.perkHead}>
              <span className={s.perkIconWrap}>
                <GraduationCap size={16} />
              </span>
              <h2 className={s.perkTitle}>Бесплатный доступ для школьников</h2>
            </div>
            <p className={s.perkText}>
              Для школьников <strong>8 класса и младше</strong> доступ к сервису
              предоставляется <strong>бесплатно</strong>.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
