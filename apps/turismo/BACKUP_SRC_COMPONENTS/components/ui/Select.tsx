import React, { forwardRef, SelectHTMLAttributes, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    placeholder = 'Selecione uma opção',
    options,
    onChange,
    variant = 'default',
    size = 'md',
    disabled,
    value,
    defaultValue,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    
    const selectedOption = options.find(opt => opt.value === selectedValue);
    
    const baseClasses = cn(
      'flex w-full items-center justify-between rounded-lg border bg-white px-3 text-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer',
      'disabled:cursor-not-allowed disabled:opacity-50',
      {
        // Variants
        'border-neutral-200 bg-white': variant === 'default',
        'border-neutral-200 bg-neutral-50': variant === 'filled',
        'border-2 border-neutral-300 bg-transparent': variant === 'outlined',
        
        // Sizes
        'h-8 px-2 text-xs': size === 'sm',
        'h-10 px-3 text-sm': size === 'md',
        'h-12 px-4 text-base': size === 'lg',
        
        // States
        'border-error-500 focus:ring-error-500/20': error,
        'hover:border-primary-300': !error && !disabled,
        'focus:border-primary-500': !error && !disabled,
      },
      className
    );

    const handleSelect = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
      setSelectedValue(optionValue);
      setIsOpen(false);
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          <button
            type="button"
            className={baseClasses}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={cn(
              'truncate',
              !selectedOption && 'text-neutral-400'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown 
              className={cn(
                'h-4 w-4 text-neutral-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )} 
            />
          </button>
          
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
                <div className="max-h-60 overflow-auto p-1">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors',
                        'hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none',
                        {
                          'bg-primary-50 text-primary-700': option.value === selectedValue,
                          'text-neutral-400 cursor-not-allowed': option.disabled,
                          'text-neutral-700': !option.disabled,
                        }
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.value === selectedValue && (
                        <Check className="h-4 w-4 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-error-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-xs text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
