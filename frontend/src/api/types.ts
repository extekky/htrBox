// -------------------------------------------------------------
// Общие типы
// -------------------------------------------------------------

export type Role = "admin" | "user";

// -------------------------------------------------------------
// Аутентификация / Сессия
// -------------------------------------------------------------

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface UserSessionInfo {
  username: string;
  role: Role;
  allowed: boolean;
  active: boolean;
  usedTraffic: number;
  expires_at: string | null;
}

/** Ответ на успешный вход — токен + данные текущего пользователя */
export interface LoginResponse extends AccessTokenResponse {
  user: UserSessionInfo;
}

// -------------------------------------------------------------
// Пользователи
// -------------------------------------------------------------

export interface UserResponse {
  username: string;
  role: Role;
  allowed: boolean;
  active: boolean;
  usedTraffic: number;
  expires_at: string | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  allowed?: boolean;
  active?: boolean;
  expires_at?: string | null;
}

export interface CreateUserResponse {
  username: string;
  hyPassword: string;
}

export interface UpdateUserRequest {
  allowed?: boolean;
  password?: string;
  active?: boolean;
  expires_at?: string | null;
}

export interface SetRoleRequest {
  role: Role;
}

export interface ChangePasswordRequest {
  /** Текущий пароль — обязателен для не-администраторов */
  password?: string;
  new_password: string;
  /** Также перегенерировать и обновить Hysteria-пароль */
  apply_hy?: boolean;
}

export interface ChangePasswordResponse {
  username: string;
  status: string;
}

export interface RegenerateHyResponse {
  username: string;
  hyPassword: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  username: string;
  message: string;
}

// -------------------------------------------------------------
// Серверы
// -------------------------------------------------------------

/** Публичное представление сервера — для обычных пользователей */
export interface ServerPublicResponse {
  id: string;
  country: string;
  city: string;
  active: boolean;
}

/** Полное представление сервера — только для администраторов */
export interface ServerAdminResponse {
  id: string;
  country: string;
  city: string;
  ip: string;
  domain: string | null;
  port: number;
  label: string;
  protocol: string;
  hysteria_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServerRequest {
  country: string;
  city: string;
  ip: string;
  domain?: string | null;
  port?: number;
  label?: string;
  protocol?: string;
  active?: boolean;
  hysteria_url?: string | null;
}

export interface UpdateServerRequest {
  country?: string;
  city?: string;
  ip?: string;
  domain?: string | null;
  port?: number;
  label?: string;
  protocol?: string;
  active?: boolean;
  hysteria_url?: string | null;
}

export interface ServerCreateResponse {
  id: string;
  country: string;
  city: string;
  ip: string;
  domain: string | null;
  port: number;
  label: string;
  protocol: string;
  hysteria_url: string | null;
  active: boolean;
}

// -------------------------------------------------------------
// Статистика трафика
// -------------------------------------------------------------

/** Один 5-минутный bucket трафика — вид со стороны пользователя */
export interface TrafficBucketResponse {
  time: string;
  delta_gb: number;
  server_id: string | null; // "all" когда не фильтруется по серверу
}

/** Один 5-минутный bucket трафика — вид со стороны сервера или глобальный */
export interface TrafficServerBucketResponse {
  time: string;
  delta_gb: number;
}

export interface TrafficUserTotalResponse {
  username: string;
  total_gb: number;
}

// -------------------------------------------------------------
// Управление Hysteria2
// -------------------------------------------------------------

export interface KickUsersRequest {
  usernames: string[];
}

export interface GenerateUrlResponse {
  url: string;
  server_id: string;
  server_host: string;
}

export interface OnlineUser {
  connections: number;
  servers: string[];
}

export type OnlineUsersResponse = Record<string, OnlineUser>;

// -------------------------------------------------------------
// Стандартный формат ошибки FastAPI
// -------------------------------------------------------------

export interface ApiError {
  detail: string | Array<{ msg: string; type: string }>;
}
