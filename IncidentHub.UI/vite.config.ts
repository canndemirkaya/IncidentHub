import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Force Vite to use the modern ESM build of @tanstack/react-query
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['@tanstack/react-query']
    },
    resolve: {
        alias: {
            '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query/build/modern/index.js')
        }
    }
})

