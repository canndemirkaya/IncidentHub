import React from 'react'
import { Table, Input, Row, Col, Pagination, Space, Button, Modal, Form, Select } from 'antd'
import { error as notifyError, ComboBox } from '..'
import type { ColumnsType } from 'antd/es/table'
import type { Column, FetchResult, DataGridProps } from './types'

export default function DataGrid<T extends Record<string, any>>(props: DataGridProps<T>) {
    const { columns, data = [], loading, page = 1, pageSize = 10, total, onPageChange, onFetch, rowKey = 'id', onCreate, onOpenCreate, createExcludeFields = [] } = props
    const [search, setSearch] = React.useState('')
    const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({})
    const [sorter, setSorter] = React.useState<{ field: string; order: 'ascend' | 'descend' | null }>({ field: '', order: null })
    const [localData, setLocalData] = React.useState<T[]>(data)
    const [remoteTotal, setRemoteTotal] = React.useState<number>(total || data.length)
    const [creating, setCreating] = React.useState(false)
    const [draftValues, setDraftValues] = React.useState<Record<string, any>>({})
    const [createModalVisible, setCreateModalVisible] = React.useState(false)
    const [createLoading, setCreateLoading] = React.useState(false)
    const [createForm] = Form.useForm()

    React.useEffect(() => {
        // Only sync `data` prop into local state when NOT using remote `onFetch`.
        // When `onFetch` is provided we control `localData` from the fetch effect
        // to avoid clobbering fetched results with the (often-empty) `data` prop.
        if (!onFetch) {
            setLocalData(data)
        }
        if (total !== undefined) setRemoteTotal(total)
    }, [data, total, onFetch])

    const [localLoading, setLocalLoading] = React.useState(false)

    const [refetchSignal, setRefetchSignal] = React.useState(0)
    React.useEffect(() => {
        const handler = () => setRefetchSignal(s => s + 1)
        window.addEventListener('incidents:refetch', handler as EventListener)
        return () => window.removeEventListener('incidents:refetch', handler as EventListener)
    }, [])

    // remote fetch if provided
    // Use a ref for `onFetch` so that callers can pass inline callbacks
    // without causing the effect to re-run repeatedly due to function identity changes.
    const onFetchRef = React.useRef(onFetch)
    React.useEffect(() => { onFetchRef.current = onFetch }, [onFetch])

    React.useEffect(() => {
        let mounted = true
        const fn = onFetchRef.current
        if (fn) {
            setLocalLoading(true)
            fn({ page, pageSize, search, filters: columnFilters, sort: sorter }).then(res => {
                if (!mounted) return
                setLocalData(res.data)
                setRemoteTotal(res.total)
            }).catch(err => {
                console.error(err)
                if (mounted) notifyError('Fetch failed', String((err as any)?.message || err))
            }).finally(() => { if (mounted) setLocalLoading(false) })
        }
        return () => { mounted = false }
        // intentionally exclude `onFetch` from deps; use ref above to pick up latest implementation
    }, [page, pageSize, search, JSON.stringify(columnFilters), sorter, refetchSignal])

    // client-side filtering + sorting when no onFetch
    const displayed = React.useMemo(() => {
        if (onFetch) return localData
        let d = [...(localData || [])]
        // column filters
        Object.entries(columnFilters).forEach(([k, v]) => {
            if (!v) return
            d = d.filter(r => String(r[k] ?? '').toLowerCase().includes(v.toLowerCase()))
        })
        // global search
        if (search) {
            const q = search.toLowerCase()
            d = d.filter(r => Object.values(r).some(val => String(val ?? '').toLowerCase().includes(q)))
        }
        // sorting
        if (sorter.field) {
            d.sort((a: any, b: any) => {
                const A = a[sorter.field]
                const B = b[sorter.field]
                if (A == null && B == null) return 0
                if (A == null) return -1
                if (B == null) return 1
                if (A < B) return sorter.order === 'ascend' ? -1 : 1
                if (A > B) return sorter.order === 'ascend' ? 1 : -1
                return 0
            })
        }
        return d
    }, [localData, columnFilters, search, sorter, onFetch])

    const start = (page - 1) * pageSize
    const pageSlice = onFetch ? displayed : displayed.slice(start, start + pageSize)

    React.useEffect(() => {
        console.debug('DataGrid localData count', localData?.length)
    }, [localData])

    React.useEffect(() => {
        console.debug('DataGrid displayed count', displayed?.length)
    }, [displayed])

    const antdColumns: ColumnsType<any> = columns.map(col => ({
        title: (
            <div>
                <div className="column-title">{col.title}</div>
                <div className="column-filter">
                    <Input size='small' placeholder={`Search ${col.title}`} value={columnFilters[col.dataIndex] || ''} onChange={e => setColumnFilters(prev => ({ ...prev, [col.dataIndex]: e.target.value }))} />
                </div>
            </div>
        ),
        dataIndex: col.dataIndex,
        key: col.key,
        render: (value: any, record: any) => {
            if (record && record.__isNew) {
                // render editor
                if (col.editType === 'select') {
                    return (
                        <ComboBox
                            options={col.editOptions}
                            value={draftValues[col.dataIndex] ?? ''}
                            onChange={v => setDraftValues(prev => ({ ...prev, [col.dataIndex]: v }))}
                            placeholder={`Select ${col.title}`}
                        />
                    )
                }
                // default input
                return <Input value={draftValues[col.dataIndex] ?? ''} onChange={e => setDraftValues(prev => ({ ...prev, [col.dataIndex]: e.target.value }))} />
            }
            return col.render ? col.render(value, record) : value
        },
        sorter: col.sorter,
        // show current sort indicator on the column
        sortOrder: sorter.field === col.dataIndex ? sorter.order as any : undefined,
        width: col.width,
    }))

    // if creating, add an actions column at start
    const finalColumns: ColumnsType<any> = React.useMemo(() => {
        if (!creating) return antdColumns
        const actionCol = {
            title: '',
            dataIndex: '__actions',
            key: '__actions',
            render: (_: any, record: any) => {
                if (!record.__isNew) return null
                return (
                    <div className="actions-row">
                        <button onClick={async () => {
                            if (!onCreate) return
                            try {
                                const created = await onCreate(draftValues as Partial<T>)
                                // replace temp row with created
                                setLocalData(prev => [created, ...prev.filter(p => !p.__isNew)])
                                setCreating(false)
                                setDraftValues({})
                            } catch (err) {
                                console.error(err)
                                notifyError('Create failed', String((err as any)?.message || err))
                            }
                        }}>OK</button>
                        <button onClick={() => {
                            // cancel
                            setLocalData(prev => prev.filter(p => !p.__isNew))
                            setCreating(false)
                            setDraftValues({})
                        }}>Cancel</button>
                    </div>
                )
            }
        }
        return [actionCol as any, ...antdColumns]
    }, [creating, antdColumns, draftValues, onCreate])

    return (
        <div className="data-grid-container">
            <Row className="data-grid-row">
                <Col>
                    {onCreate && (
                        <Button onClick={() => {
                            if (onOpenCreate) {
                                onOpenCreate()
                                return
                            }
                            setCreateModalVisible(true)
                        }}>New</Button>
                    )}
                </Col>
                <Col flex='auto' />
                <Col>
                    <Space>
                        <Input.Search placeholder='Search' allowClear onSearch={v => { setSearch(v) }} onChange={e => setSearch(e.target.value)} className="search-input" />
                    </Space>
                </Col>
            </Row>

            <Table
                columns={finalColumns}
                dataSource={pageSlice}
                loading={loading || localLoading}
                pagination={false}
                rowKey={rowKey}
                onChange={(pagination, filters, sorterArg: any) => {
                    if (!sorterArg) return
                    // sorterArg may provide different shapes depending on antd usage
                    const field = sorterArg.field || sorterArg.columnKey || (sorterArg.column && sorterArg.column.dataIndex)
                    const order = sorterArg.order || null
                    if (field) setSorter({ field, order })
                }}
            />

            <Modal open={createModalVisible} title='Create' onCancel={() => { setCreateModalVisible(false); createForm.resetFields() }} footer={null}>
                <Form form={createForm} layout='vertical' onFinish={async (vals) => {
                    if (!onCreate) return
                    try {
                        setCreateLoading(true)
                        const created = await onCreate(vals)
                        // if DataGrid is using remote fetch, trigger refetch signal
                        if (onFetch) {
                            window.dispatchEvent(new Event('incidents:refetch'))
                        } else {
                            const item = created?.data || created
                            setLocalData(prev => [item, ...prev])
                        }
                        setCreateModalVisible(false)
                        createForm.resetFields()
                    } catch (err) {
                        console.error(err)
                        notifyError('Create failed', String((err as any)?.message || err))
                    } finally {
                        setCreateLoading(false)
                    }
                }}>
                    {columns
                        .filter(col => {
                            // always exclude server-managed or action columns
                            const idx = String(col.dataIndex)
                            if (!idx) return false
                            if (idx === 'createdAt' || idx === '__actions' || col.key === 'actions') return false
                            // allow caller to exclude fields (e.g. `status` managed by backend)
                            if (createExcludeFields.includes(idx)) return false
                            return true
                        })
                        .map(col => (
                            <Form.Item key={String(col.dataIndex)} name={col.dataIndex} label={col.title} rules={(col as any).required ? [{ required: true }] : []}>
                                {col.editType === 'select' ? (
                                    <Select options={(col.editOptions || []).map((o: any) => ({ label: o.label, value: o.value }))} />
                                ) : (
                                    <Input />
                                )}
                            </Form.Item>
                        ))}
                    <Form.Item>
                        <Space>
                            <Button htmlType='submit' type='primary' loading={createLoading}>Create</Button>
                            <Button onClick={() => { setCreateModalVisible(false); createForm.resetFields() }}>Cancel</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <div className="pagination-container">
                <Pagination current={page} pageSize={pageSize} total={onFetch ? remoteTotal : displayed.length} onChange={(p, ps) => onPageChange && onPageChange(p, ps)} />
            </div>
        </div>
    )
}
