export type ToastType = 'success' | 'error' | 'info';

export interface ToastPayload {
  message: string;
  type?: ToastType;
  duration?: number;
}

type Listener = (payload: ToastPayload) => void;

const listeners: Listener[] = [];

function subscribe(cb: Listener): () => void {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i > -1) { listeners.splice(i, 1); }
  };
}

function show(payload: ToastPayload): void {
  listeners.forEach(cb => cb(payload));
}

const toast = {
  subscribe,
  show,
  success: (message: string, duration?: number) => show({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => show({ message, type: 'error', duration }),
  info: (message: string, duration?: number) => show({ message, type: 'info', duration }),
};

export default toast;
