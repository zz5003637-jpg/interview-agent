import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-700 text-white hover:bg-blue-800 disabled:bg-slate-300 disabled:text-white',
  secondary:
    'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
