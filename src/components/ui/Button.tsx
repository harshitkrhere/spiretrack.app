import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'ocean' | 'ocean-outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:pointer-events-none shadow-sm';

        const variants = {
            // Primary (80%) - Green
            primary: 'bg-[#1F8A4C] text-white hover:bg-[#178544] active:bg-[#14703a] hover:shadow-md',
            secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900',
            danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md',
            ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none',
            // Accent (20%) - Ocean blue for special emphasis
            'ocean': 'bg-[#0C3D5F] text-white hover:bg-[#0F4D78] hover:shadow-md',
            'ocean-outline': 'bg-transparent text-[#0C3D5F] border-2 border-[#0C3D5F] hover:bg-[#0C3D5F] hover:text-white',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs rounded-lg',
            md: 'h-10 px-5 text-sm rounded-lg',
            lg: 'h-12 px-6 text-base rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
