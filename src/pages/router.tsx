import { Switch, Route, Redirect } from "wouter";

import { useAuthStore } from "@/stores/authStore";

import { LoginPage } from "@/pages/LoginPage";
// import { RegisterPage } from "@/pages/RegisterPage";
// import { AdminOverviewPage } from "@/pages/AdminOverviewPage";
// import { UsersPage } from "@/pages/UsersPage";
// import { ServersPage } from "@/pages/ServersPage";
import { ProfilePage } from "@/pages/ProfilePage";
// import { SettingsPage } from "@/pages/SettingsPage";
// import { ManualPage } from "@/pages/ManualPage";
// import { NotFoundPage } from "@/pages/NotFoundPage";
// import { ChekavPage } from "@/pages/ChekavPage";

// ---------------------------------------------------------------------------
// Route Guards
// ---------------------------------------------------------------------------

/**
 * Protects admin-only routes.
 */
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) {
    return <Redirect to="/login" />;
  }

  if (user.role !== "admin") {
    return <Redirect to="/profile" />;
  }

  return <Component />;
}

/**
 * Protects routes that require authentication (any role).
 * Redirects to /login if not authenticated.
 */
function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

/**
 * Protects public-only routes (/login, /register).
 * Redirects authenticated users away:
 *   admin -> /admin
 *   regular user -> /profile
 */
function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (token && user) {
    const redirectTo = user.role === "admin" ? "/admin" : "/profile";
    return <Redirect to={redirectTo} />;
  }

  return <Component />;
}

// ---------------------------------------------------------------------------
// Main Router
// ---------------------------------------------------------------------------
export function AppRouter() {
  const user = useAuthStore((s) => s.user);

  return (
    <Switch>
      {/* Public routes — only accessible when not logged in */}
      <Route path="/login">
        <PublicOnlyRoute component={LoginPage} />
      </Route>

      {/* <Route path="/register">
        <PublicOnlyRoute component={RegisterPage} />
      </Route> */}

      {/* Admin-only routes */}
      {/* <Route path="/admin">
        <AdminRoute component={AdminOverviewPage} />
      </Route> */}

      {/* <Route path="/users">
        <AdminRoute component={UsersPage} />
      </Route> */}

      {/* <Route path="/servers">
        <AdminRoute component={ServersPage} />
      </Route> */}

      {/* Authenticated user routes (any role) */}
      <Route path="/profile">
        <PrivateRoute component={ProfilePage} />
      </Route>

      {/* <Route path="/settings">
        <PrivateRoute component={SettingsPage} />
      </Route> */}

      {/* <Route path="/manual">
        <PrivateRoute component={ManualPage} />
      </Route> */}

      {/* <Route path="/chekav">
        <PrivateRoute component={ChekavPage} />
      </Route> */}

      {/* Root — smart redirect based on auth & role */}
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

      {/* Catch-all 404 */}
      {/* <Route component={NotFoundPage} /> */}
    </Switch>
  );
}