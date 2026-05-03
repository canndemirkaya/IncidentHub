import type React from 'react'

export type ComboOption = {
    label: string
    value: string | number
    disabled?: boolean
}

export interface ComboBoxProps {
    options?: ComboOption[]
    value?: string | number | (string | number)[]
    onChange?: (value: string | number | (string | number)[]) => void
    placeholder?: string
    allowClear?: boolean
    style?: React.CSSProperties
    mode?: 'multiple' | 'tags' | undefined
}
