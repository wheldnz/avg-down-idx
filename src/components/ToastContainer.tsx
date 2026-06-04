import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastItem } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type} ${toast.removing ? 'toast-out' : ''}`}
        >
          <span>
            {toast.type === 'success' ? <CheckCircle size={18} /> : 
             toast.type === 'error' ? <XCircle size={18} /> : 
             toast.type === 'warning' ? <AlertTriangle size={18} /> :
             <Info size={18} />}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
