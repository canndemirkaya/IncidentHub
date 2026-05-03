import { notification } from 'antd';

const DEFAULT_DURATION = 3; // seconds
notification.config({ duration: DEFAULT_DURATION });

export function setDefaultNotificationDuration(seconds: number) {
    notification.config({ duration: seconds });
}

export function openNotification(args: any) {
    notification.open(args as any);
}

export function success(message: string, description?: React.ReactNode, duration?: number) {
    notification.success({ message, description, duration });
}

export function error(message: string, description?: React.ReactNode, duration?: number) {
    notification.error({ message, description, duration });
}

export function info(message: string, description?: React.ReactNode, duration?: number) {
    notification.info({ message, description, duration });
}

export function warn(message: string, description?: React.ReactNode, duration?: number) {
    notification.warning({ message, description, duration });
}

export function close(key?: string) {
    ; (notification as any).close?.(key)
}

const Notification = {
    open: openNotification,
    success,
    error,
    info,
    warn,
    close,
    setDefaultNotificationDuration,
};

export type { };
export default Notification;
