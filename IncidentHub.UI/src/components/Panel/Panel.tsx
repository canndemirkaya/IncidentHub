import React from 'react'
import { Card } from 'antd'
import type { Props as PanelProps } from './types'

export default function Panel({ title, style, children }: PanelProps) {
    return (
        <div className="panel-wrapper">
            <Card title={title} className="panel-card" style={style}>
                {children}
            </Card>
        </div>
    )
}
