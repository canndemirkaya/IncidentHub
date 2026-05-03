export type ReportOptions = {
    showNotification?: boolean
    title?: string
}

type ReporterFn = (err: any, opts?: ReportOptions) => void

let _reporter: ReporterFn | null = null
const _queue: Array<{ err: any; opts?: ReportOptions }> = []

export function setReporter(fn: ReporterFn) {
    _reporter = fn
    // flush queue
    while (_queue.length > 0) {
        const item = _queue.shift()!
        try { _reporter(item.err, item.opts) } catch { /* ignore */ }
    }
}

export function reportError(err: any, opts?: ReportOptions) {
    if (_reporter) {
        try { _reporter(err, opts) } catch (e) { console.error('reporter failed', e) }
    } else {
        _queue.push({ err, opts })
    }
}

let _reconnecting = false

export function setReconnecting(v: boolean) {
    _reconnecting = !!v
}

export function isReconnecting() { return _reconnecting }

export default { setReporter, reportError }
