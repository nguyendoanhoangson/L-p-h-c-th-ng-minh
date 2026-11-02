import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface NotificationContextType {
  notify: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, type, title, message };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => notify(msg, 'success', title), [notify]);
  const error = useCallback((msg: string, title?: string) => notify(msg, 'error', title), [notify]);
  const warning = useCallback((msg: string, title?: string) => notify(msg, 'warning', title), [notify]);
  const info = useCallback((msg: string, title?: string) => notify(msg, 'info', title), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
      {/* Toast floating container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const bgColors = {
            success: 'bg-[#091e1d] border-emerald-500/80 text-emerald-100 shadow-emerald-950/50',
            error: 'bg-[#240e18] border-rose-500/80 text-rose-100 shadow-rose-950/50',
            warning: 'bg-[#26190a] border-amber-500/80 text-amber-100 shadow-amber-950/50',
            info: 'bg-[#0c1836] border-blue-500/80 text-blue-100 shadow-blue-950/50',
          }[toast.type];

          const IconComponent = {
            success: CheckCircle2,
            error: XCircle,
            warning: AlertCircle,
            info: Info,
          }[toast.type];

          const iconColor = {
            success: 'text-emerald-400',
            error: 'text-rose-400',
            warning: 'text-amber-400',
            info: 'text-blue-400',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border rounded-xl shadow-xl p-3.5 flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-2 ${bgColors}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold mb-0.5 text-white">{toast.title}</div>}
                <div className="leading-snug text-slate-200">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
