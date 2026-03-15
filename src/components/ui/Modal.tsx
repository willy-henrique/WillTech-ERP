import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** Em mobile, renderiza como drawer bottom-sheet */
  mobileDrawer?: boolean;
}

export function Modal({ open, onClose, title, children, className, mobileDrawer = true }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={clsx(
          'relative bg-white shadow-2xl z-10 max-h-[90vh] overflow-y-auto',
          mobileDrawer
            ? 'fixed bottom-0 left-0 right-0 rounded-t-2xl md:relative md:bottom-auto md:left-auto md:right-auto md:rounded-xl md:max-w-lg md:w-full md:mx-4'
            : 'rounded-xl max-w-lg w-full mx-4',
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl md:rounded-t-xl z-10">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
