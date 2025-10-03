import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast.jsx';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => {
    showToast(message, 'success', duration);
  };

  const showError = (message, duration) => {
    showToast(message, 'error', duration);
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            style={{ 
              position: 'fixed',
              top: `${20 + index * 80}px`,
              right: '20px',
              zIndex: 1000 + index
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              isVisible={toast.isVisible}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};