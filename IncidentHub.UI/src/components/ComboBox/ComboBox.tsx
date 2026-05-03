import React from 'react'
import { Select } from 'antd'
import type { ComboBoxProps, ComboOption } from './types/ComboBox'

export default function ComboBox(props: ComboBoxProps) {
    const { options = [], value, onChange, placeholder, allowClear = true, style, mode } = props

    const mapped = (options || []).map((o: ComboOption) => ({ label: o.label, value: o.value, disabled: o.disabled }))

    return (
        <Select
            options={mapped}
            value={value}
            onChange={onChange as any}
            placeholder={placeholder}
            allowClear={allowClear}
            style={style}
            mode={mode as any}
        />
    )
}
