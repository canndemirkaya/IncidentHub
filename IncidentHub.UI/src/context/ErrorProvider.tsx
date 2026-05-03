import React from 'react'
import { ErrorModal, Notification } from '../components'
import { setReporter, reportError as reportErrorService, isReconnecting } from '../shared/error/errorService'

type ErrorRecord = { err: any; opts?: { title?: string } | undefined }

const ErrorContext = React.createContext({ reportError: (e: any, o?: any) => { } })

export function useError() {
    return React.useContext(ErrorContext)
}

export const ErrorProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [current, setCurrent] = React.useState<ErrorRecord | null>(null)

    const reportError = React.useCallback((err: any, opts?: { showNotification?: boolean; title?: string }) => {
        const title = opts?.title
        const message = err?.message || (typeof err === 'string' ? err : 'An error occurred')
        if (opts?.showNotification !== false) {
            // show notification
            Notification.error(title || 'Error', message)
        } else {
            setCurrent({ err: { ...err, title }, opts: { title } })
        }
    }, [])

    React.useEffect(() => {
        // register reporter for non-react modules
        setReporter((err: any, opts?: any) => {
            // if app is currently reconnecting, convert API/network errors
            // to a single persistent reconnecting warning instead of spamming errors
            if (isReconnecting() && opts?.showNotification !== false) {
                try {
                    Notification.open({
                        key: 'socket-reconnecting',
                        message: 'Reconnecting...',
                        description: 'Attempting to reconnect to the server. Network requests may fail during this time.',
                        duration: 0,
                        placement: 'topRight',
                        style: { background: '#fffbe6', border: '1px solid #ffe58f' }
                    })
                } catch { }
            } else {
                reportError(err, { showNotification: opts?.showNotification !== false, title: opts?.title })
            }
        })
        return () => { setReporter(() => { }) }
    }, [reportError])

    return (
        <ErrorContext.Provider value={{ reportError }}>
            {children}
            <ErrorModal visible={!!current} error={current?.err} onClose={() => setCurrent(null)} />
        </ErrorContext.Provider>
    )
}

export default ErrorProvider
