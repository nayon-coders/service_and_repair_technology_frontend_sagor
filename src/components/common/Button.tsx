import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500/30 border-transparent shadow-xs',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400/20 border-transparent',
  outline: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300 focus:ring-slate-400/20 shadow-xs',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500/30 border-transparent shadow-xs',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500/30 border-transparent shadow-xs',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent focus:ring-slate-400/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-xs font-semibold rounded-xl gap-2',
  lg: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium border focus:outline-none focus:ring-2 transition duration-150 select-none disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className={iconSizes[size]} />}
          <span>{children}</span>
          {RightIcon && <RightIcon className={iconSizes[size]} />}
        </>
      )}
    </button>
  );
};

