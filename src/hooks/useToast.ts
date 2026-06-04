import { useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: string;
  removing: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    
    setToasts(prev => [...prev, { id, message, type, removing: false }]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300); // Wait for transition out
    }, 3000);
  }, []);

  return { toasts, showToast };
}
