import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, MessageCircleQuestionMark } from "lucide-react";

import { register as registerUser } from "@/api/users";
import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { USER_KEYS } from "@/hooks/useUsers";
import { ApiRequestError } from "@/api/client";
import { queryClient } from "@/queryClient";
import { registerSchema, type RegisterFormValues } from "@/lib/validators";
import { Card, CardContent } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { styles } from "@/styles";

const s = styles.registerPage;

export function RegisterPage() {
  // navigate(path) — программный переход на другую страницу
  const [, navigate] = useLocation();

  // Берём функцию setAuth из глобального хранилища Zustand.
  // Она сохраняет токен и данные пользователя после успешного входа.
  const setAuth = useAuthStore((s) => s.setAuth);
  const { error: toastError, success: toastSuccess } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Валидация при каждом изменении для лучшего UX
  });

  // Обработчик отправки формы
  async function onSubmit(values: RegisterFormValues) {
    try {
      // 1. Регистрация нового пользователя
      await registerUser({
        username: values.username,
        password: values.password,
      });

      // 2. Автоматический вход для получения токена доступа
      const authResult = await login({
        username: values.username,
        password: values.password,
      });

      // Прогреваем кэш профиля, чтобы после авто-логина не было лишнего /users/me
      queryClient.setQueryData(USER_KEYS.me, authResult.user);

      // 3. Сохраняем токен и пользователя в глобальном состоянии
      setAuth(authResult.access_token, authResult.user);

      // 4. Редиректим: администратора — в /admin, остальных — в /profile
      navigate(authResult.user.role === "admin" ? "/admin" : "/profile");

      // 5. Уведомление о необходимости активации, если аккаунт ещё не активен
      if (!authResult.user.active) {
        setTimeout(() => {
          toastSuccess(
            "Аккаунт создан",
            "Для доступа к VPN требуется активация подписки",
          );
        }, 400);
      }
    } catch (err) {
      console.error("Полная ошибка при регистрации:", err);

      if (err instanceof ApiRequestError) {
        console.log(`Статус: ${err.status} | Сообщение: ${err.message}`);

        if (err.status === 409) {
          toastError(
            "Имя занято",
            "Пользователь с таким именем уже существует",
          );
        } else if (err.status === 429) {
          toastError(
            "Слишком много попыток",
            "Подождите немного и попробуйте снова",
          );
        } else {
          toastError("Ошибка сервера", `${err.status} — ${err.message}`);
        }
      } else {
        toastError("Ошибка сети", "Не удалось подключиться к серверу");
        console.error("Неизвестная ошибка:", err);
      }
    }
  }

  return (
    // Центрируем карточку на весь экран
    <div className={s.root}>
      <div className={s.inner}>
        {/* Заголовок над карточкой */}
        <div className={s.header}>
          <h1 className={s.title}>HtrBox</h1>
          <p className={s.subtitle}>Пройдите регистрацию</p>
        </div>

        {/* Карточка с формой */}
        <Card className={s.card}>
          <CardContent className={s.cardContent}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate // отключаем браузерную валидацию — используем Zod
              className={s.form}
            >
              {/* Поле: имя пользователя */}
              <FormInput
                label="Пользователь"
                autoComplete="username" // браузер может автоматически подставлять данные
                autoFocus // фокус при открытии страницы
                placeholder="username"
                error={errors.username?.message}
                {...register("username")}
              />

              {/* Поле: пароль — FormInput сам добавит кнопку-глазик */}
              <FormInput
                label="Пароль"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              {/* Поле: подтверждение пароля — тоже с глазиком */}
              <FormInput
                label="Подтверждение"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirm_password?.message}
                {...register("confirm_password")}
              />

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={isSubmitting} // блокируем повторный клик во время запроса
                className={s.submitButton}
              >
                {/* Пока идёт запрос — показываем спиннер и текст "Регистрация..." */}
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className={s.submitIcon} />
                    Регистрация...
                  </>
                ) : (
                  "Создать аккаунт"
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Ссылка на страницу входа */}
        <div className={s.footer}>
          <Link href="/login" className={s.footerLink}>
            <ArrowLeft size={14} />
            Уже зарегистрированы? Войти
          </Link>
        </div>
        <div className={s.footer}>
          <a
            className={s.footerLink}
            href="https://t.me/stdoq"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircleQuestionMark size={14} />
            Написать в поддержку
          </a>
        </div>
      </div>

      <div className={s.legalFooter}>
        <Link href="/service" className={s.legalLink}>
          Услуга
        </Link>
        <Link href="/refund" className={s.legalLink}>
          Возврат
        </Link>
        <Link href="/offer" className={s.legalLink}>
          Оферта
        </Link>
        <Link href="/privacy" className={s.legalLink}>
          Данные
        </Link>
        <Link href="/contacts" className={s.legalLink}>
          Контакты
        </Link>
      </div>
    </div>
  );
}
