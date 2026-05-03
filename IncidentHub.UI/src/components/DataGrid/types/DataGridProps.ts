import type { Column } from './Column'
import type { FetchResult } from './FetchResult'

export type DataGridProps<T> = {
    columns: Column<T>[]
    data?: T[]
    loading?: boolean
    page?: number
    pageSize?: number
    total?: number
    onPageChange?: (page: number, pageSize: number) => void
    onFetch?: (params: { page: number; pageSize: number; search?: string; filters?: Record<string, string>; sort?: { field: string; order: 'ascend' | 'descend' | null } }) => Promise<FetchResult<T>>
    rowKey?: string
    onCreate?: (payload: Partial<T>) => Promise<T>
    onOpenCreate?: () => void
    /**
     * List of column dataIndex values to exclude from the auto-generated create modal form.
     * Useful to hide server-managed fields like `status` or `createdAt`.
     */
    createExcludeFields?: string[]
}
