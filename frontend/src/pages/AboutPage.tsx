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
  "оплата трафика, мониторинга и инфраструктуры",
  "поддержка пользователей, помощь с подключением и обновления сервиса",
];

const serviceIncludes = [
  "доступ к лк и VPN ссылке",
  "управление подпиской, сервером и аккаунтом",
  "статистика трафика и техническая поддержка",
];

export function AboutPage() {
  return (
    <AppShell>
      <div className={s.root}>
        <div className={s.inner}>
          <div>
            <h1 className={s.title}>О сервисе</h1>
          </div>

          <Card className={s.heroCard}>
            <p className={s.heroText}>
              <strong>HtrBox</strong> это личный кабинет для VPN на основе
              протокола <strong>Hysteria2</strong>. Hysteria2 —
              высокопроизводительный, легковесный прокси-протокол нового
              поколения, использующий модифицированный протокол QUIC (поверх
              UDP) для обхода блокировок и работы в нестабильных сетях.
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
                <strong>Стасом</strong>.
              </p>
              <p className={s.sectionText}>
                Если вы пользуетесь сервисом, то наверняка знакомы со мной лично
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
                Задача — дать доступ к серверам в разных странах и сделать это
                просты для пользователя.
              </p>
              <p className={s.sectionText}>
                Сервис позволяет подключаться к VPN без сложной ручной
                настройки, а также управлять своей подпиской и сервером через
                удобный интерфейс.
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
              предоставляется <strong>бесплатно</strong>. Доступ выдается
              на усмотрение администратора сервиса.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
