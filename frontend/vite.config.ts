import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import path from 'path'

export default defineConfig({
    // плагины которые использует Vite
    plugins: [react(), tailwindcss(),],
    resolve: {
        // алиасы для импортов — @ означает папку src
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },

    server: {
        // Порт, на котором будет запущен frontend в режиме разработки
        port: 5173,

        // Настройка прокси — перенаправляет запросы на бэкенд
        proxy: {
            // WebSocket прокси для реального времени (например, уведомления, чат)
            "/api/ws": {
                target: "ws://backend:8000",   // адрес бэкенда внутри Docker
                ws: true,                      // включить поддержку WebSocket
                rewrite: (path) => path.replace(/^\/api/, ""),
            },

            // Основной HTTP прокси для всех API запросов
            "/api": {
                target: "http://backend:8000", // адрес бэкенда (имя сервиса в docker-compose)
                changeOrigin: true,            // изменяет заголовок Host на target
                rewrite: (path) => path.replace(/^\/api/, ""),
                // secure: false,              // раскомментировать, если бэкенд на self-signed HTTPS
            },
        },
    },
})