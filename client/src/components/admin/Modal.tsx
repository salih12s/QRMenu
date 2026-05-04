import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`relative w-full ${size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'} bg-brand-card border border-brand-border rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-glow max-h-[92vh] flex flex-col`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <h3 className="font-display font-bold text-brand-primary">{title}</h3>
              <button
                onClick={onClose}
                type="button"
                className="h-8 w-8 grid place-items-center rounded-full hover:bg-[var(--color-card-2)]"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
