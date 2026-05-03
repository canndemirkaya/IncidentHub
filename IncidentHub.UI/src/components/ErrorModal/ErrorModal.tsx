import React from 'react'
import { Modal, Button, Typography } from 'antd'
const { Paragraph, Text } = Typography

type Props = {
    visible: boolean
    error: any
    onClose: () => void
}

export default function ErrorModal({ visible, error, onClose }: Props) {
    const title = error?.title || (error?.message ? 'Error' : 'An error occurred')
    const message = error?.message || (typeof error === 'string' ? error : undefined)
    const details = error?.stack || JSON.stringify(error?.response?.data || error, null, 2)

    return (
        <Modal open={visible} title={title} onCancel={onClose} footer={[
            <Button key='close' onClick={onClose}>Close</Button>,
            <Button key='copy' onClick={() => { navigator.clipboard?.writeText(details || message || '') }} type='primary'>Copy details</Button>
        ]} width={800}>
            {message && <Paragraph><Text strong>Message:</Text> {message}</Paragraph>}
            <Paragraph>
                <Text strong>Details:</Text>
            </Paragraph>
            <div className="error-details">
                <pre>{details}</pre>
            </div>
        </Modal>
    )
}
