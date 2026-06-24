// ============================================
// LifeOS — XP Notification Toast Container
// ============================================

import React, { useEffect } from 'react';
import { useXpToastStore, type XpToast } from '../../stores/xpToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';

export default function XpToastContainer() {
  const toasts = useXpToastStore((s) => s.toasts);

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast }: { toast: XpToast }) {
  const removeToast = useXpToastStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.85, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } }}
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        borderRadius: 12,
        background: toast.isLevelUp 
          ? 'linear-gradient(135deg, rgba(210, 153, 34, 0.95), rgba(245, 158, 11, 0.95))' 
          : 'rgba(13, 17, 23, 0.9)',
        border: toast.isLevelUp 
          ? '1px solid rgba(210, 153, 34, 0.4)' 
          : '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: toast.isLevelUp 
          ? '0 8px 32px rgba(210, 153, 34, 0.3), 0 0 16px rgba(210, 153, 34, 0.2)' 
          : '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(99, 102, 241, 0.1)',
        backdropFilter: 'blur(12px)',
        color: '#ffffff',
        minWidth: 200
      }}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: toast.isLevelUp 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(99, 102, 241, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {toast.isLevelUp ? (
          <Trophy size={16} color="#ffffff" className="animate-bounce" />
        ) : (
          <Zap size={16} color="#818cf8" />
        )}
      </div>
      <div>
        <div style={{ 
          fontSize: 13, 
          fontWeight: 700, 
          color: '#ffffff',
          letterSpacing: '-0.01em'
        }}>
          {toast.isLevelUp ? 'Level Up!' : `+${toast.amount} XP`}
        </div>
        {toast.message && (
          <div style={{ 
            fontSize: 11, 
            color: toast.isLevelUp ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-muted)',
            marginTop: 2
          }}>
            {toast.message}
          </div>
        )}
      </div>
    </motion.div>
  );
}
