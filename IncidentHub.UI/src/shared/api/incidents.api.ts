import api from './client'

export async function fetchIncidents(params: any) {
    const res = await api.get('/incidents/GetAll', { params })
    return res.data
}

export async function createIncident(payload: any) {
    const res = await api.post('/incidents/Create', payload)
    return res.data
}

export async function updateIncident(id: string, payload: any) {
    const res = await api.patch(`/incidents/Update/${id}`, payload)
    return res.data
}

export async function deleteIncident(id: string) {
    const res = await api.delete(`/incidents/Delete/${id}`)
    return res.data
}

export async function fetchAuditLogs(incidentId: string) {
    const res = await api.get(`/incidents/${incidentId}/audit-logs`)
    return res.data
}

export async function fetchSummary() {
    const res = await api.get('/incidents/summary')
    return res.data
}
