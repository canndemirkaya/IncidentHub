import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import SocketProvider from './context/SocketProvider'
import 'antd/dist/reset.css'
import './styles/global.scss'
import ErrorProvider from './context/ErrorProvider'
import { reportError } from './shared/error/errorService'

const queryClient = new QueryClient({ defaultOptions: ({ queries: { onError: (err: any) => reportError(err, { showNotification: true }) }, mutations: { onError: (err: any) => reportError(err, { showNotification: true }) } } as any) })

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorProvider>
            <QueryClientProvider client={queryClient}>
                <SocketProvider>
                    <App />
                </SocketProvider>
            </QueryClientProvider>
        </ErrorProvider>
    </React.StrictMode>
)
