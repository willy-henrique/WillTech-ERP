import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(
            'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white disabled:opacity-50 disabled:bg-slate-100',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] font-bold text-red-500 uppercase">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
