import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";

import { register as registerUser } from "@/api/users";
import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { ApiRequestError } from "@/api/client";
import { registerSchema, type RegisterFormValues } from "@/lib/validators";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";

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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-background">
      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-in">
        {/* Заголовок над карточкой */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            HtrBox
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Пройдите регистрацию
          </p>
        </div>

        {/* Карточка с формой */}
        <Card className="card-auth">
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate // отключаем браузерную валидацию — используем Zod
              className="flex flex-col gap-4"
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
                className={cn(
                  "mt-1 h-10 w-full rounded-lg text-sm font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "active:scale-[0.98] transition-all duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2",
                )}
              >
                {/* Пока идёт запрос — показываем спиннер и текст "Регистрация..." */}
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
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
        <div className="flex items-center justify-center mt-5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Уже зарегистрированы? Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
