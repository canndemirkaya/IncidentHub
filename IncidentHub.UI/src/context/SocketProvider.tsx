import React from 'react'
import { io, Socket } from 'socket.io-client'
import { Notification, SocketStatus } from '../components'
import { setReconnecting } from '../shared/error/errorService'

type ContextValue = { socket?: Socket | null; connected: boolean }

const SocketContext = React.createContext<ContextValue>({ socket: null, connected: false })

export function useSocket() { return React.useContext(SocketContext) }

export const SocketProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [socket, setSocket] = React.useState<Socket | null>(null)
    const [connected, setConnected] = React.useState(false)
    const disconnectNotifiedRef = React.useRef(false)

    React.useEffect(() => {
        const s = io((import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3000')
        setSocket(s)

        const showDisconnect = () => {
            if (disconnectNotifiedRef.current) return
            disconnectNotifiedRef.current = true
            try { setReconnecting(true) } catch { }
            Notification.open({
                key: 'socket-disconnect',
                message: 'Connection lost',
                description: <SocketStatus onReconnect={() => s.connect()} />,
                duration: 0,
                placement: 'topRight',
                style: { background: '#fff7e6', border: '1px solid #ffd591' },
                onClose: () => { disconnectNotifiedRef.current = false; try { setReconnecting(false) } catch { } }
            })
        }

        s.on('connect', () => {
            setConnected(true)
            try { Notification.close('socket-disconnect'); Notification.close('socket-reconnecting') } catch { }
            disconnectNotifiedRef.current = false
            try { setReconnecting(false) } catch { }
            Notification.success('Socket connected', 'Reconnected to the server', 3)
        })
        s.on('disconnect', () => { setConnected(false); showDisconnect() })
        s.on('connect_error', () => { setConnected(false); showDisconnect() })
        s.on('connect_timeout', () => { setConnected(false); showDisconnect() })

        return () => { s.disconnect(); setSocket(null) }
    }, [])

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider
