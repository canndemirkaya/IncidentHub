import { ReactNode } from 'react'

export type Column<T> = {
    title: string
    dataIndex: string
    key: string
    render?: (value: any, record: T) => ReactNode
    sorter?: boolean
    width?: number
    /** editor configuration for inline create/edit */
    editType?: 'input' | 'select'
    editOptions?: Array<{ label: string; value: any }>
}
