import { Switch, Route, Redirect } from "wouter";

import { useAuthStore } from "@/stores/authStore";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AdminBoard } from "@/pages/AdminBoard";
import { UserManage } from "@/pages/UsersPage";
import { ServersPage } from "@/pages/ServersPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ManualPage } from "@/pages/ManualPage";
import { ChekavoPage } from "@/pages/ChekavoPage";
import { AboutPage } from "@/pages/AboutPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// -------------------------------------------------------------
// Тип пропса — общий для всех гардов
// -------------------------------------------------------------

interface RouteGuardProps {
  component: React.ComponentType;
}

// -------------------------------------------------------------
// AdminRoute — только для пользователей с ролью «admin»
// Незалогиненных -> /login, обычных пользователей -> /profile
// -------------------------------------------------------------

function AdminRoute({ component: Component }: RouteGuardProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) return <Redirect to="/login" />;
  if (user.role !== "admin") return <Redirect to="/profile" />;

  return <Component />;
}

// -------------------------------------------------------------
// PrivateRoute — любой авторизованный пользователь
// Незалогиненных -> /login
// -------------------------------------------------------------

function PrivateRoute({ component: Component }: RouteGuardProps) {
  const token = useAuthStore((s) => s.token);

  if (!token) return <Redirect to="/login" />;

  return <Component />;
}

// -------------------------------------------------------------
// UserOnlyRoute — только для обычных пользователей
// Незалогиненных -> /login, администраторов -> /admin
// -------------------------------------------------------------

function UserOnlyRoute({ component: Component }: RouteGuardProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) return <Redirect to="/login" />;
  if (user.role === "admin") return <Redirect to="/admin" />;

  return <Component />;
}

// -------------------------------------------------------------
// PublicOnlyRoute — только для незалогиненных (/login, /register)
// Авторизованных редиректит по роли:
//   admin       -> /admin
//   обычный     -> /profile
// -------------------------------------------------------------

function PublicOnlyRoute({ component: Component }: RouteGuardProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (token && user) {
    const redirectTo = user.role === "admin" ? "/admin" : "/profile";
    return <Redirect to={redirectTo} />;
  }

  return <Component />;
}

// -------------------------------------------------------------
// Корневой роутер приложения
// -------------------------------------------------------------

export function AppRouter() {
  const user = useAuthStore((s) => s.user);

  return (
    <Switch>
      {/* -- Публичные маршруты (только для незалогиненных) -- */}
      <Route path="/login">
        <PublicOnlyRoute component={LoginPage} />
      </Route>
      <Route path="/register">
        <PublicOnlyRoute component={RegisterPage} />
      </Route>

      {/* -- Только для администраторов ----------------------- */}
      <Route path="/admin">
        <AdminRoute component={AdminBoard} />
      </Route>
      <Route path="/users">
        <AdminRoute component={UserManage} />
      </Route>
      <Route path="/servers">
        <AdminRoute component={ServersPage} />
      </Route>

      {/* -- Приватные маршруты (любой авторизованный) ------- */}
      <Route path="/profile">
        <UserOnlyRoute component={ProfilePage} />
      </Route>
      <Route path="/settings">
        <PrivateRoute component={SettingsPage} />
      </Route>
      <Route path="/about">
        <PrivateRoute component={AboutPage} />
      </Route>
      <Route path="/manual">
        <UserOnlyRoute component={ManualPage} />
      </Route>
      <Route path="/chekavo">
        <UserOnlyRoute component={ChekavoPage} />
      </Route>

      {/* -- Корень: редирект по статусу авторизации и роли -- */}
      <Route path="/">
        {user ? (
          user.role === "admin" ? (
            <Redirect to="/admin" />
          ) : (
            <Redirect to="/profile" />
          )
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      {/* -- 404 - страница не найдена -- */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}
