import React, { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number | string;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 500,
  className = '',
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            overflowY: 'auto',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Card Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={className}
            style={{
              position: 'relative',
              zIndex: 10000,
              margin: 'auto',
              width: '100%',
              maxWidth,
              maxHeight: 'calc(100vh - 48px)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--color-border)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '20px 24px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                }}
              >
                <div>
                  {typeof title === 'string' ? (
                    <h2
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.02em',
                        margin: 0,
                      }}
                    >
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                        marginTop: 4,
                        marginBottom: 0,
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="btn btn-ghost btn-icon"
                  style={{
                    width: 30,
                    height: 30,
                    color: 'var(--color-text-muted)',
                    marginLeft: 12,
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {children}
            </div>

            {/* Pinned Footer */}
            {footer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 10,
                  padding: '16px 24px',
                  borderTop: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
