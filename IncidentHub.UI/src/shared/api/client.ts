import axios from 'axios'
import { reportError } from '../error/errorService'

const api = axios.create({ baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000' })

api.interceptors.response.use(
    r => r,
    err => {
        try { reportError(err, { showNotification: true, title: 'API Error' }) } catch (e) { console.error(e) }
        return Promise.reject(err)
    }
)

export default api
