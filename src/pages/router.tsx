import { Switch, Route, Redirect } from "wouter";

import { useAuthStore } from "@/stores/authStore";

import { LoginPage } from "@/pages/LoginPage";

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);

    if (token && user) {
        const redirectTo = user.role === "admin" ? "/admin" : "/profile";
        return <Redirect to={redirectTo} />;
    }

    return <Component />;
}

export function AppRouter() {
    const user = useAuthStore((s) => s.user);

    return (
        <Switch>
            {/* Public routes — only accessible when not logged in */}
            <Route path="/login">
                <PublicOnlyRoute component={LoginPage} />
            </Route>

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
        </Switch>
    );
}