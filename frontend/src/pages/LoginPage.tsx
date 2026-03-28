import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";

import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { useRestore } from "@/hooks/useRestore";
import { initServerData } from "@/hooks/useServers";
import { ApiRequestError } from "@/api/client";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
// import { Shader } from "@/components/common/Shader";

export function LoginPage() {
    // navigate(path) — программный переход на другую страницу
    const [, navigate] = useLocation();

    // Берём функцию setAuth из глобального хранилища Zustand.
    // Она сохраняет токен и данные пользователя после успешного входа.
    const setAuth = useAuthStore((s) => s.setAuth);
    const { error: toastError, success: toastSuccess } = useToast();

    const { restoring } = useRestore();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setFocus,
    } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

    // Обработчик отправки формы
    async function onSubmit(values: LoginFormValues) {
        try {
            // Отправляем логин/пароль на сервер, получаем токен и данные юзера
            const result = await login(values);

            // Сохраняем токен и пользователя в глобальном состоянии
            setAuth(result.access_token, result.user);
            toastSuccess("Добро пожаловать", result.user.username);

            // Предварительная выборка серверов и URL-адресов подключений перед переходом
            if (result.user.role !== "admin" && result.user.active) {
                await initServerData(result.user.username);
            }

            // Редиректим: администратора — в /admin, остальных — в /profile
            navigate(result.user.role === "admin" ? "/admin" : "/profile");
        } catch (err) {

            if (err instanceof ApiRequestError) {

                if (err.status === 401) {
                    toastError("Неверные данные", "Проверьте имя пользователя и пароль");
                    setFocus("password");
                } else if (err.status === 403) {
                    toastError("Аккаунт заблокирован", "Обратитесь к администратору");
                } else if (err.status === 429) {
                    toastError("Слишком много попыток", "Подождите немного и попробуйте снова");
                } else if (err.status === 404) {
                    toastError("Эндпоинт не найден", "Проверьте URL запроса на сервере");
                } else {
                    toastError("Ошибка сервера", `${err.status} — ${err.message}`);
                }
            } else {
                toastError("Нет подключения", "Не удалось связаться с сервером");
            }
        }
    }

    if (restoring) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 size={28} className="animate-spin" />
                    <span className="text-sm">Восстановление сессии...</span>
                </div>
            </div>
        );
    }

    return (
        // Центрируем карточку на весь экран
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-background">
            {/* <Shader /> */}
            <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-in">

                {/* Заголовок над карточкой */}
                <div className="flex flex-col items-center gap-3 mb-8 text-center">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        HtrBox
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Войдите в свой аккаунт
                    </p>
                </div>

                {/* Карточка с формой */}
                <Card className="card-auth">
                    <CardContent className="p-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate            // отключаем браузерную валидацию — используем Zod
                            className="flex flex-col gap-4"
                        >

                            {/* Поле: имя пользователя */}
                            <FormInput
                                label="Пользователь"
                                autoComplete="username"     // браузер может автоматически подставлять данные
                                autoFocus                   // фокус при открытии страницы
                                placeholder="username"
                                error={errors.username?.message}
                                {...register("username")}
                            />

                            {/* Поле: пароль — FormInput сам добавит кнопку-глазик */}
                            <FormInput
                                label="Пароль"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register("password")}
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
                                {/* Пока идёт запрос — показываем спиннер и текст "Вход..." */}
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" />
                                        Вход...
                                    </>
                                ) : (
                                    "Войти"
                                )}
                            </button>

                        </form>
                    </CardContent>
                </Card>

                {/* Ссылка на страницу регистрации */}
                <div className="flex items-center justify-center mt-5">
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <UserPlus size={14} />
                        Нет аккаунта? Зарегистрироваться
                    </Link>
                </div>

            </div>
        </div>
    );
}