// src/components/widgets/ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// ========================================
// TOAST SYSTEM
// ========================================
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: '#dcfce7',
      borderColor: '#16a34a',
      iconColor: '#16a34a',
      titleColor: '#166534'
    },
    error: {
      icon: XCircle,
      bgColor: '#fee2e2',
      borderColor: '#dc2626',
      iconColor: '#dc2626',
      titleColor: '#991b1b'
    },
    warning: {
      icon: AlertCircle,
      bgColor: '#fef3c7',
      borderColor: '#f59e0b',
      iconColor: '#f59e0b',
      titleColor: '#92400e'
    },
    info: {
      icon: Info,
      bgColor: '#dbeafe',
      borderColor: '#3b82f6',
      iconColor: '#3b82f6',
      titleColor: '#1e40af'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor } = config[toast.type];

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        minWidth: '300px',
        animation: isExiting 
          ? 'slideOut 0.3s ease-out forwards' 
          : 'slideIn 0.3s ease-out',
        transform: isExiting ? 'translateX(400px)' : 'translateX(0)'
      }}
    >
      <Icon size={24} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
      
      <div style={{ flex: 1 }}>
        <h4 style={{
          margin: '0 0 4px 0',
          fontSize: '15px',
          fontWeight: 600,
          color: titleColor
        }}>
          {toast.title}
        </h4>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#374151',
          lineHeight: '1.5'
        }}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        style={{
          background: 'rgba(0,0,0,0.1)',
          border: 'none',
          borderRadius: '6px',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <X size={16} color="#374151" />
      </button>
    </div>
  );
};

// ========================================
// CONFIRM MODAL SYSTEM
// ========================================
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm deve ser usado dentro de ToastProvider');
  }
  return context;
};

// ========================================
// COMBINED PROVIDER
// ========================================
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    type: 'danger'
  });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  // Toast functions
  const showToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Confirm functions
  const showConfirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmOptions({
        ...opts,
        confirmText: opts.confirmText || 'OK',
        cancelText: opts.cancelText || 'Cancelar',
        type: opts.type || 'danger'
      });
      setIsConfirmOpen(true);
      setConfirmResolver(() => resolve);
    });
  };

  const handleConfirmOk = () => {
    if (confirmResolver) confirmResolver(true);
    setIsConfirmOpen(false);
  };

  const handleConfirmCancel = () => {
    if (confirmResolver) confirmResolver(false);
    setIsConfirmOpen(false);
  };

  const typeConfig = {
    danger: {
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
      confirmBg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      titleColor: '#991b1b'
    },
    warning: {
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      confirmBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      titleColor: '#92400e'
    },
    info: {
      iconBg: '#dbeafe',
      iconColor: '#3b82f6',
      confirmBg: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      titleColor: '#1e40af'
    }
  };

  const config = typeConfig[confirmOptions.type || 'danger'];

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ConfirmContext.Provider value={{ showConfirm }}>
        {children}
        
        {/* Toast Container */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '400px'
        }}>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

        {/* Confirm Modal */}
        {isConfirmOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={handleConfirmCancel}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '440px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                animation: 'scaleIn 0.2s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                padding: '24px 24px 20px 24px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: config.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <AlertTriangle size={28} color={config.iconColor} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: config.titleColor
                    }}>
                      {confirmOptions.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '15px',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {confirmOptions.message}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px 24px',
                backgroundColor: '#f9fafb',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={handleConfirmCancel}
                  style={{
                    padding: '10px 24px',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {confirmOptions.cancelText}
                </button>

                <button
                  onClick={handleConfirmOk}
                  style={{
                    padding: '10px 24px',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '10px',
                    background: config.confirmBg,
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {confirmOptions.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes slideIn {
              from {
                transform: translateX(400px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            @keyframes slideOut {
              from {
                transform: translateX(0);
                opacity: 1;
              }
              to {
                transform: translateX(400px);
                opacity: 0;
              }
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes scaleIn {
              from { 
                opacity: 0;
                transform: scale(0.95);
              }
              to { 
                opacity: 1;
                transform: scale(1);
              }
            }
          `}
        </style>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};