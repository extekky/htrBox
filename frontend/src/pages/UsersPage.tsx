import { useState } from "react";
import { UserPlus } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { UserTable } from "@/components/users/UserTable";
import { UserCreateModal } from "@/components/users/UserCreateForm";
import { UserEditModal } from "@/components/users/UserEditForm";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { UserResponse } from "@/api/types";

// -------------------------------------------------------------
// Страница управления пользователями
// -------------------------------------------------------------

/**
 * Основной компонент страницы пользователей в админ-панели.
 *
 * - Отображает таблицу всех пользователей системы.
 * - Управляет состоянием модальных окон создания и редактирования.
 * - Позволяет быстро добавлять новых пользователей через кнопку в шапке.
 */
export function UserManage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
        {/* Шапка страницы */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Пользователи
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Управление аккаунтами
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className={cn(
              "inline-flex items-center gap-2 px-4 h-9 rounded-xl",
              "bg-primary/10 text-primary border border-primary/20",
              "hover:bg-primary/15 transition-colors text-sm font-medium",
            )}
          >
            <UserPlus size={15} />
            Добавить
          </button>
        </div>

        {/* Карточка с таблицей пользователей */}
        <Card className="overflow-hidden">
          <UserTable onEdit={setEditingUser} />
        </Card>
      </div>

      {/* Модальные окна */}
      {showCreate && <UserCreateModal onClose={() => setShowCreate(false)} />}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </AppShell>
  );
}
