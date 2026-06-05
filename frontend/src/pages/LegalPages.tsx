import { Link } from "wouter";
import {
  ArrowLeft,
  BadgeRussianRuble,
  Ban,
  CalendarDays,
  Clock,
  CreditCard,
  Database,
  FileCheck2,
  Headphones,
  LockKeyhole,
  Mail,
  MapPin,
  PackageCheck,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  Truck,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { styles } from "@/styles";

const s = styles.legalPage;

const supportEmail = "garryerel@gmail.com";
const supportTelegram = "@stdoq";
const supportTelegramUrl = "https://t.me/stdoq";

const processedData = [
  "логин пользователя и технический идентификатор аккаунта",
  "пароль в защищенном виде, без хранения исходного пароля",
  "роль, статус аккаунта, срок действия подписки и служебные настройки доступа",
  "техническая статистика использования сервиса, включая объем трафика",
  "данные обращений в поддержку, если пользователь сам их передает",
];

const dataPurposes = [
  "создание аккаунта и вход в личный кабинет",
  "предоставление доступа к VPN-сервису и управление подпиской",
  "техническая поддержка, диагностика ошибок и защита от злоупотреблений",
  "исполнение требований законодательства и правил платежного провайдера",
];

const dataRights = [
  "получить информацию об обработке своих персональных данных",
  "уточнить, заблокировать или удалить данные, если они неполные, устаревшие или обработаны неправомерно",
  "отозвать согласие на обработку данных, если обработка ведется на основании согласия",
  "направить запрос на удаление аккаунта через поддержку",
];

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function LegalLayout({ title, subtitle, children }: LegalLayoutProps) {
  return (
    <div className={s.root}>
      <div className={s.inner}>
        <div className={s.topNav}>
          <Link href="/login" className={s.backLink}>
            <ArrowLeft size={15} />
            Вернуться обратно
          </Link>
          <nav className={s.navLinks}>
            <Link href="/service" className={s.navLink}>
              Услуга
            </Link>
            <Link href="/refund" className={s.navLink}>
              Возврат
            </Link>
            <Link href="/offer" className={s.navLink}>
              Оферта
            </Link>
            <Link href="/privacy" className={s.navLink}>
              Данные
            </Link>
            <Link href="/contacts" className={s.navLink}>
              Контакты
            </Link>
          </nav>
        </div>

        <header className={s.header}>
          <h1 className={s.title}>{title}</h1>
          <p className={s.subtitle}>{subtitle}</p>
          <p className={s.meta}>Дата публикации: 2 июня 2026 года</p>
        </header>

        {children}
      </div>
    </div>
  );
}

function FactRow({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  text: React.ReactNode;
}) {
  return (
    <Card className={s.factCard}>
      <span className={s.iconWrap}>
        <Icon size={16} />
      </span>
      <div className={s.factTextWrap}>
        <h2 className={s.sectionTitle}>{title}</h2>
        <p className={s.text}>{text}</p>
      </div>
    </Card>
  );
}

export function ContactsPage() {
  return (
    <LegalLayout
      title="Контакты и сведения о сервисе"
      subtitle="Актуальные контакты поддержки HtrBox для вопросов по сервису, оплате, возвратам и персональным данным."
    >
      <section className={s.grid}>
        <FactRow
          icon={Mail}
          title="Email"
          text={
            <a className={s.inlineLink} href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
          }
        />
        <FactRow
          icon={Send}
          title="Telegram поддержки"
          text={
            <a
              className={s.inlineLink}
              href={supportTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {supportTelegram}
            </a>
          }
        />
        <FactRow
          icon={UserRound}
          title="Оператор сервиса"
          text="Владелец сервиса HtrBox."
        />
        <FactRow
          icon={MapPin}
          title="Адрес"
          text="Москва, улица Льва Толстого, 16, подъезд 4, «Мулен Руж»"
        />
      </section>

      <Card className={s.sectionCard}>
        <div className={s.sectionHead}>
          <span className={s.iconWrap}>
            <Headphones size={16} />
          </span>
          <h2 className={s.sectionTitle}>Поддержка</h2>
        </div>
        <p className={s.text}>
          Обращения по работе сервиса, доступу к аккаунту, оплатам, возвратам и
          удалению аккаунта принимаются через Email и Telegram. Запрос на
          удаление аккаунта обрабатывается в течение 1 дня.
        </p>
      </Card>
    </LegalLayout>
  );
}

export function ServicePage() {
  return (
    <LegalLayout
      title="Описание услуги и условия предоставления"
      subtitle="HtrBox предоставляет пользователю доступ к VPN-сервису на основе Hysteria2 через личный кабинет."
    >
      <section className={s.grid}>
        <FactRow
          icon={PackageCheck}
          title="Что получает пользователь"
          text="Доступ к личной VPN-ссылке, выбору доступного сервера, статистике трафика и базовой технической поддержке."
        />
        <FactRow
          icon={BadgeRussianRuble}
          title="Стоимость"
          text="Стоимость доступа указывается на странице оплаты или сообщается пользователю перед оплатой."
        />
        <FactRow
          icon={Clock}
          title="Срок предоставления"
          text="Доступ предоставляется на оплаченный период подписки. Срок подписки отображается в личном кабинете пользователя."
        />
        <FactRow
          icon={Truck}
          title="Доставка"
          text="Физическая доставка не осуществляется. Услуга предоставляется в электронном виде через личный кабинет после регистрации и активации доступа."
        />
      </section>

      <Card className={s.sectionCard}>
        <div className={s.sectionHead}>
          <span className={s.iconWrap}>
            <ShieldCheck size={16} />
          </span>
          <h2 className={s.sectionTitle}>Ограничения</h2>
        </div>
        <p className={s.text}>
          Сервис предназначен для законного доступа к сети и защиты соединения.
          Пользователь обязан соблюдать законодательство применимой юрисдикции и
          не использовать сервис для противоправных действий.
        </p>
      </Card>
    </LegalLayout>
  );
}

export function RefundPage() {
  return (
    <LegalLayout
      title="Условия возврата и отмены платежа"
      subtitle="Порядок обращения по вопросам ошибочного платежа, отмены оплаты и возврата средств за доступ к сервису HtrBox."
    >
      <section className={s.grid}>
        <FactRow
          icon={RotateCcw}
          title="Как запросить возврат"
          text={
            <>
              Пользователь может потребовать возврат денежных средств за услугу
              при ее неисправности по вине сервиса или при невыдаче доступа в
              срок до 48 часов. Для обращения напишите в поддержку на почту{" "}
              <a className={s.inlineLink} href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>{" "}
              или в telegram{" "}
              <a
                className={s.inlineLink}
                href={supportTelegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {supportTelegram}
              </a>
              . В обращении укажите логин аккаунта, дату оплаты и причину
              обращения.
            </>
          }
        />
        <FactRow
          icon={Clock}
          title="Срок возврата после одобрения"
          text={
            <>
              Обращения по возврату рассматриваются в течение 3 рабочих дней с
              момента получения всей необходимой информации.
              <br />В случае одобрения заявки возврат денежных средств
              осуществляется в течение 72 часов с момента принятия решения о
              возврате.
            </>
          }
        />
        <FactRow
          icon={CreditCard}
          title="Способ возврата"
          text="Если возврат одобрен, средства возвращаются тем же способом, которым была произведена оплата, если платежный провайдер поддерживает такой возврат."
        />
        <FactRow
          icon={Ban}
          title="Когда возврат может быть отклонен"
          text="Возврат может быть отклонен, если услуга была фактически оказана, доступ активирован и пользователь начал пользоваться сервисом, кроме случаев неисправности услуги по вине сервиса."
        />
      </section>

      <Card className={s.sectionCard}>
        <div className={s.sectionHead}>
          <span className={s.iconWrap}>
            <FileCheck2 size={16} />
          </span>
          <h2 className={s.sectionTitle}>Отмена платежа</h2>
        </div>
        <p className={s.text}>
          Если оплата была совершена по ошибке или пользователь хочет отменить
          платеж до активации доступа, необходимо как можно быстрее обратиться в
          поддержку. Если доступ не был выдан в течение 48 часов, пользователь
          может направить требование о возврате денежных средств.
        </p>
      </Card>
    </LegalLayout>
  );
}

export function OfferPage() {
  return (
    <LegalLayout
      title="Договор оферты"
      subtitle="Настоящий документ является предложением владельца сервиса HtrBox заключить договор на предоставление доступа к VPN-сервису."
    >
      <Card className={s.sectionCard}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>1. Предмет договора</h2>
        </div>
        <p className={s.text}>
          Владелец сервиса HtrBox предоставляет пользователю доступ к
          VPN-сервису, а пользователь оплачивает доступ и использует сервис на
          условиях настоящей оферты.
        </p>
      </Card>

      <Card className={s.sectionCard}>
        <h2 className={s.sectionTitle}>2. Порядок оказания услуги</h2>
        <p className={s.text}>
          Услуга предоставляется в электронном виде. После регистрации и оплаты
          пользователь получает доступ к личной VPN-ссылке и доступным
          настройкам подключения. Физическая доставка не осуществляется.
        </p>
      </Card>

      <Card className={s.sectionCard}>
        <h2 className={s.sectionTitle}>3. Стоимость и оплата</h2>
        <p className={s.text}>
          Стоимость доступа указывается на странице оплаты или сообщается
          пользователю перед оплатой. Оплата может выполняться через платежного
          провайдера lava.top. Платежный провайдер самостоятельно обрабатывает
          платежные данные пользователя.
        </p>
      </Card>

      <Card className={s.sectionCard}>
        <h2 className={s.sectionTitle}>4. Возврат и отмена платежа</h2>
        <p className={s.text}>
          Условия возврата и отмены платежа указаны на странице{" "}
          <Link className={s.inlineLink} href="/refund">
            «Условия возврата и отмены платежа»
          </Link>
          . Пользователь может обратиться в поддержку по email или telegram.
        </p>
      </Card>

      <Card className={s.sectionCard}>
        <h2 className={s.sectionTitle}>5. Обязанности пользователя</h2>
        <p className={s.text}>
          Пользователь обязуется использовать сервис законно, не передавать
          доступ третьим лицам без согласования и не совершать действий, которые
          нарушают законодательство, права третьих лиц или стабильность работы
          сервиса.
        </p>
      </Card>

      <Card className={s.sectionCard}>
        <h2 className={s.sectionTitle}>6. Персональные данные</h2>
        <p className={s.text}>
          Обработка персональных данных осуществляется согласно{" "}
          <Link className={s.inlineLink} href="/privacy">
            политике обработки персональных данных
          </Link>
          .
        </p>
      </Card>

      <Card className={s.sectionCard}>
        <h2 className={s.sectionTitle}>7. Контакты</h2>
        <p className={s.text}>
          По вопросам исполнения оферты, оплаты, возврата и поддержки
          пользователь может обратиться на email{" "}
          <a className={s.inlineLink} href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>{" "}
          или в Telegram{" "}
          <a
            className={s.inlineLink}
            href={supportTelegramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {supportTelegram}
          </a>
          .
        </p>
      </Card>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Политика обработки персональных данных"
      subtitle="Настоящая политика описывает, какие данные обрабатывает сервис HtrBox, для каких целей и как пользователь может запросить удаление аккаунта."
    >
      <section className={s.grid}>
        <Card className={s.sectionCard}>
          <div className={s.sectionHead}>
            <span className={s.iconWrap}>
              <Database size={16} />
            </span>
            <h2 className={s.sectionTitle}>Какие данные обрабатываются</h2>
          </div>
          <div className={s.bulletList}>
            {processedData.map((item) => (
              <div key={item} className={s.bulletItem}>
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card className={s.sectionCard}>
          <div className={s.sectionHead}>
            <span className={s.iconWrap}>
              <ShieldCheck size={16} />
            </span>
            <h2 className={s.sectionTitle}>Цели обработки</h2>
          </div>
          <div className={s.bulletList}>
            {dataPurposes.map((item) => (
              <div key={item} className={s.bulletItem}>
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className={s.sectionCard}>
        <div className={s.sectionHead}>
          <span className={s.iconWrap}>
            <CreditCard size={16} />
          </span>
          <h2 className={s.sectionTitle}>Платежные данные</h2>
        </div>
        <p className={s.text}>
          HtrBox не хранит реквизиты банковских карт и другие платежные данные.
          Оплата может выполняться через платежного провайдера{" "}
          <strong>lava.ru</strong>, который обрабатывает платежную информацию по
          своим правилам и документам. В сервисе может храниться только
          служебная информация о факте оплаты, сроке подписки или статусе
          доступа, необходимая для предоставления услуги.
        </p>
      </Card>

      <section className={s.grid}>
        <FactRow
          icon={LockKeyhole}
          title="Хранение и защита"
          text="Данные используются только для работы сервиса, поддержки пользователей и защиты аккаунтов. Доступ к данным ограничен администратором сервиса. Данные не продаются, не публикуются и не передаются третьим лицам, кроме случаев, когда это необходимо для оплаты, исполнения закона или защиты прав сервиса и пользователей."
        />
        <FactRow
          icon={CalendarDays}
          title="Срок обработки"
          text="Данные аккаунта обрабатываются в течение срока использования сервиса. После удаления аккаунта данные удаляются или обезличиваются, кроме информации, которую необходимо временно сохранить по требованиям закона, платежных правил или для разрешения спорных ситуаций."
        />
      </section>

      <Card className={s.sectionCard}>
        <div className={s.sectionHead}>
          <span className={s.iconWrap}>
            <Trash2 size={16} />
          </span>
          <h2 className={s.sectionTitle}>
            Удаление аккаунта и права пользователя
          </h2>
        </div>
        <p className={s.text}>
          Пользователь может запросить удаление аккаунта через поддержку. Запрос
          на удаление аккаунта обрабатывается в течение 1 дня с момента
          получения обращения.
        </p>
        <div className={s.bulletList}>
          {dataRights.map((item) => (
            <div key={item} className={s.bulletItem}>
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card className={s.sectionCard}>
        <p className={s.text}>
          Продолжая использовать сайт и личный кабинет HtrBox, пользователь
          подтверждает, что ознакомился с настоящей политикой. Если условия
          политики не подходят, пользователь может прекратить использование
          сервиса и обратиться в поддержку для удаления аккаунта.
        </p>
      </Card>
    </LegalLayout>
  );
}
