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
    }
})