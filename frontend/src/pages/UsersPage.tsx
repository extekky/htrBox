import { useState } from "react";
import { UserPlus } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { UserTable } from "@/components/users/UserTable";
import { UserCreateModal } from "@/components/users/UserCreateForm";
import { UserEditModal } from "@/components/users/UserEditForm";
import { Card } from "@/components/ui/Card";
import type { UserResponse } from "@/api/types";
import { styles } from "@/styles";

const s = styles.userManagePage;

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
      <div className={s.root}>
        {/* Шапка страницы */}
        <div className={s.header}>
          <div>
            <h1 className={s.title}>Пользователи</h1>
            <p className={s.subtitle}>Управление аккаунтами</p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className={s.createButton}
          >
            <UserPlus size={15} />
            Добавить
          </button>
        </div>

        {/* Карточка с таблицей пользователей */}
        <Card className={s.tableCard}>
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
