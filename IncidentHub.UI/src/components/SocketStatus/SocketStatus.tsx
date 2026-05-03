import React from 'react'
import { Button } from 'antd'
import Notification from '../Notification/Notification'
import { isReconnecting } from '../../shared/error/errorService'
import type { Props } from './types'

export default function SocketStatus({ onReconnect }: Props) {
    // This component only renders the notification UI; actual socket state is
    // controlled by a provider. We read reconnecting state lazily when opened.

    const handleReconnect = () => { onReconnect?.() }

    return (
        <div>
            <div className="mb-8">Unable to reach the server. Some features may be unavailable.</div>
            <div>
                <Button size='small' type='primary' onClick={handleReconnect}>Reconnect</Button>
                <Button size='small' className="ml-8" onClick={() => Notification.close('socket-disconnect')}>Dismiss</Button>
            </div>
        </div>
    )
}
