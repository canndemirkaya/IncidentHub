import React, { useState } from 'react'
import { Row, Col, Card, Button, Modal, Drawer, Space, Tag, Popconfirm, Form, Input, Select, Spin } from 'antd'
import { Notification } from '../components'
import { reportError } from '../shared/error/errorService'
import { DataGrid } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchIncidents, createIncident, updateIncident, deleteIncident, fetchAuditLogs, fetchSummary } from '../shared/api/incidents.api'
import { useSocket } from '../context/SocketProvider'

const services = ['Payment API', 'Auth Service', 'Notification Worker', 'User Service', 'Billing Service']

function SeverityTag({ severity }: { severity: string }) {
    const map: any = { critical: 'red', high: 'orange', medium: 'gold', low: 'green' }
    return <Tag color={map[severity] || 'default'}>{severity}</Tag>
}

export default function DashboardPage() {
    const [detail, setDetail] = useState<any>(null)

    const qc = useQueryClient()
    const [highlightId, setHighlightId] = useState<string | null>(null)
    const { connected: socketConnected } = useSocket()


    const createMut = useMutation({
        mutationFn: createIncident,
        // optimistic: add to cache briefly then refetch
        onMutate: async (newIncident: any) => {
            await (qc as any).cancelQueries(['incidents'])
            const previous = (qc as any).getQueryData(['incidents'])
            // don't try to fake id; we refetch onSettled
            return { previous }
        },
        onError: (_err, _newIncident, context: any) => {
            (qc as any).setQueryData(['incidents'], context.previous)
            reportError(_err, { showNotification: true, title: 'Create failed' })
        },
        onSuccess: (data: any) => { Notification.success('Incident created'); qc.invalidateQueries({ queryKey: ['incidents'] }); setHighlightId(data.data?.id || null); setTimeout(() => setHighlightId(null), 3000); window.dispatchEvent(new Event('incidents:refetch')) },
    })

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => updateIncident(id, payload),
        onMutate: async ({ id, payload }) => {
            await (qc as any).cancelQueries(['incidents'])
            const prev = (qc as any).getQueryData(['incidents'])
                (qc as any).setQueryData(['incidents'], (old: any) => {
                    if (!old) return old
                    return { ...old, data: old.data.map((it: any) => it.id === id ? { ...it, ...payload } : it) }
                })
            return { prev }
        },
        onError: (_err, _vars, context: any) => {
            if (context?.prev) qc.setQueryData(['incidents'], context.prev)
            reportError(_err, { showNotification: true, title: 'Update failed' })
        },
        onSettled: () => { (qc as any).invalidateQueries(['incidents']); setDetail(null); window.dispatchEvent(new Event('incidents:refetch')) },
        onSuccess: () => { Notification.success('Updated') }
    })

    const deleteMut = useMutation({
        mutationFn: (id: string) => deleteIncident(id),
        onMutate: async (id: string) => {
            await (qc as any).cancelQueries(['incidents'])
            const prev = (qc as any).getQueryData(['incidents'])
                (qc as any).setQueryData(['incidents'], (old: any) => ({ ...old, data: (old?.data || []).filter((i: any) => i.id !== id) }))
            return { prev }
        },
        onError: (_err, _id, context: any) => {
            if (context?.prev) qc.setQueryData(['incidents'], context.prev)
            reportError(_err, { showNotification: true, title: 'Delete failed' })
        },
        onSettled: () => { (qc as any).invalidateQueries(['incidents']); window.dispatchEvent(new Event('incidents:refetch')) }
    })

    const columns: any = [
        {
            title: 'Title', dataIndex: 'title', key: 'title', render: (t: any, row: any) => (
                <div className={`incident-row-highlight ${row.id === highlightId ? 'incident-row-active' : ''}`}>{t}</div>
            ), editType: 'input'
        },
        { title: 'Service', dataIndex: 'service', key: 'service', editType: 'select', editOptions: services.map(s => ({ label: s, value: s })) },
        { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (s: any) => <SeverityTag severity={s} />, editType: 'select', editOptions: [{ label: 'low', value: 'low' }, { label: 'medium', value: 'medium' }, { label: 'high', value: 'high' }, { label: 'critical', value: 'critical' }] },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <Tag>{s}</Tag> },
        { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: any) => new Date(d).toLocaleString() },
        {
            title: 'Actions', key: 'actions', render: (_: any, record: any) => (
                <Space>
                    <Button size='small' onClick={() => setDetail(record)}>View</Button>
                    <Popconfirm title='Delete?' onConfirm={() => deleteMut.mutate(record.id)}>
                        <Button danger size='small'>Delete</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    const auditQuery = useQuery({
        queryKey: ['auditLogs', detail?.id],
        queryFn: () => fetchAuditLogs(detail.id),
        enabled: !!detail,
    })
    const summaryQuery = useQuery({
        queryKey: ['summary'],
        queryFn: () => fetchSummary(),
    })

    const [gridFilters, setGridFilters] = React.useState<Record<string, any>>({})
    const [gridLoading, setGridLoading] = React.useState(false)
    const [activeCard, setActiveCard] = React.useState<'total' | 'open' | 'critical' | null>(null)

    const handleCardClick = (type: 'total' | 'open' | 'critical') => {
        if (type === 'total') {
            setGridFilters({})
            setActiveCard('total')
        }
        if (type === 'open') {
            setGridFilters({ status: 'open' })
            setActiveCard('open')
        }
        if (type === 'critical') {
            setGridFilters({ severity: 'critical' })
            setActiveCard('critical')
        }
        // trigger a global refetch event in case DataGrid listens to it
        window.dispatchEvent(new Event('incidents:refetch'))
    }

    return (
        <>
            <Row gutter={[16, 16]} className="dashboard-row">
                <Col span={6}><Card>
                    <div className="dashboard-connection">
                        <div>
                            <div className="summary-title">Connection</div>
                            <div style={{ fontWeight: 600 }}>{socketConnected ? 'Online' : 'Offline'}</div>
                        </div>
                        <div className="status-dot" style={{ background: socketConnected ? '#52c41a' : '#ff4d4f' }} />
                    </div>
                </Card></Col>
                <Col span={6}>
                    <Card hoverable onClick={() => handleCardClick('total')} className="summary-card" style={{ boxShadow: activeCard === 'total' ? '0 0 0 2px rgba(24,144,255,0.12)' : undefined }}>
                        <div className="summary-title">Total</div>
                        <div className="summary-value">{summaryQuery.data?.data?.total ?? '-'}</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable onClick={() => handleCardClick('open')} className="summary-card" style={{ boxShadow: activeCard === 'open' ? '0 0 0 2px rgba(24,144,255,0.12)' : undefined }}>
                        <div className="summary-title">Open</div>
                        <div className="summary-value">{summaryQuery.data?.data?.open ?? '-'}</div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable onClick={() => handleCardClick('critical')} className="summary-card" style={{ boxShadow: activeCard === 'critical' ? '0 0 0 2px rgba(24,144,255,0.12)' : undefined }}>
                        <div className="summary-title">Critical</div>
                        <div className="summary-value">{summaryQuery.data?.data?.critical ?? '-'}</div>
                    </Card>
                </Col>

            </Row>


            <Card>
                <Spin spinning={gridLoading}>
                    <DataGrid
                        columns={columns}
                        createExcludeFields={['status']}
                        onFetch={async ({ page, pageSize, /* search, */ filters: colFilters }) => {
                            // show loading while fetching
                            setGridLoading(true)
                            try {
                                // backend rejects unknown 'search' param; only send page/limit and explicit column filters
                                // merge card-level filters (gridFilters) with any column filters
                                const mergedFilters = { ...(colFilters || {}), ...(gridFilters || {}) }
                                const res: any = await fetchIncidents({ page, limit: pageSize, ...mergedFilters })
                                return { data: res.data || [], total: res.meta?.total ?? (res.data?.length || 0) }
                            } finally {
                                setGridLoading(false)
                            }
                        }}
                        rowKey='id'
                        onCreate={async (payload: any) => {
                            const created = await createMut.mutateAsync(payload)
                            // return created record for DataGrid to update
                            return created.data || created
                        }}
                    />
                </Spin>
            </Card>


            <Drawer open={!!detail} onClose={() => setDetail(null)} width={520} title='Incident Detail'>
                {detail && (
                    <div>
                        <h3>{detail.title}</h3>
                        <p>{detail.description}</p>
                        <p><strong>Service:</strong> {detail.service}</p>
                        <p><strong>Severity:</strong> <SeverityTag severity={detail.severity} /></p>
                        <div className="audit-section">
                            <Form layout='vertical' onFinish={(vals) => updateMut.mutate({ id: detail.id, payload: vals })} initialValues={{ status: detail.status }}>
                                <Form.Item name='status' label='Status'>
                                    <Select options={[{ label: 'open', value: 'open' }, { label: 'investigating', value: 'investigating' }, { label: 'resolved', value: 'resolved' }]} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type='primary' htmlType='submit' loading={(updateMut as any).isLoading}>Update</Button>
                                </Form.Item>
                            </Form>
                        </div>

                        <div className="audit-section">
                            <h4>Audit Logs</h4>
                            {auditQuery.isLoading && <div>Loading...</div>}
                            {auditQuery.data?.data?.length === 0 && <div>No audit logs</div>}
                            {auditQuery.data?.data?.map((a: any) => (
                                <Card key={a.id} size='small' className="audit-card">
                                    <div className="audit-meta">{new Date(a.createdAt).toLocaleString()} — {a.action}</div>
                                    <div className="audit-pre">
                                        <pre>{JSON.stringify(a.newValue || a.oldValue || {}, null, 2)}</pre>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </Drawer>
        </>
    )
}



