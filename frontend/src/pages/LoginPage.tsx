import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react";

import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
// import { useSessionRestore } from "@/hooks/useSessionRestore";
// import { initServerData }    from "@/hooks/useServerInit";
import { ApiRequestError } from "@/api/client";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";

// Вспомогательный компонент: поле ввода
// Выносим повторяющийся блок «label + input + ошибка» в отдельный компонент,
// чтобы не дублировать одинаковый JSX два раза (для логина и для пароля).
interface FieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {/* Подпись над полем */}
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
            </label>

            {/* Само поле (передаётся снаружи через children) */}
            {children}

            {/* Текст ошибки — показывается только если она есть */}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

// Общие CSS-классы для <input>
// Выносим в константу, чтобы не копировать одну и ту же строку дважды.
const inputCls = (hasError: boolean) =>
    cn(
        "w-full h-10 px-3 rounded-lg bg-input border text-sm text-foreground",
        "placeholder:text-muted-foreground/40",
        "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
        "transition-colors",
        // Если есть ошибка — красная рамка, иначе — обычная
        hasError ? "border-destructive focus:ring-destructive" : "border-border",
    );

export function LoginPage() {
    // navigate(path) — программный переход на другую страницу
    const [, navigate] = useLocation();

    // Берём функцию setAuth из глобального хранилища Zustand.
    // Она сохраняет токен и данные пользователя после успешного входа.
    const setAuth = useAuthStore((s) => s.setAuth);
    const { error: toastError } = useToast();
    // Видно ли сейчас поле пароля (true = текст, false = точки)
    const [showPassword, setShowPassword] = useState(false);

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

            // Редиректим: администратора — в /admin, остальных — в /profile
            navigate(result.user.role === "admin" ? "/admin" : "/profile");
        } catch (err) {
            console.error("Полная ошибка при логине:", err);

            if (err instanceof ApiRequestError) {
                console.log(`Статус: ${err.status} | Сообщение: ${err.message}`);

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
                            <Field label="Пользователь" error={errors.username?.message}>
                                <input
                                    {...register("username")}
                                    type="text"
                                    autoComplete="username"      // браузер может автоматически подставлять данные
                                    autoFocus                    // фокус при открытии страницы
                                    placeholder="username"
                                    className={inputCls(!!errors.username)}
                                />
                            </Field>

                            {/* Поле: пароль (с кнопкой показать/скрыть) */}
                            <Field label="Пароль" error={errors.password?.message}>
                                <div className="relative">
                                    <input
                                        {...register("password")}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className={cn(inputCls(!!errors.password), "pr-10")} // pr-10 — место под кнопку
                                    />

                                    {/* Кнопка-глазик: переключает видимость пароля */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}  // не попадает в Tab-навигацию
                                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </Field>

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