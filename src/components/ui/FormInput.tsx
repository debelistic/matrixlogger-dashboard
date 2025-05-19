import React from 'react';
import { UseFormRegister, FieldError, Path, RegisterOptions, FieldValues } from 'react-hook-form';

interface FormInputProps<TFormValues extends FieldValues> {
  id: Path<TFormValues>;
  label: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<TFormValues>;
  registerOptions?: RegisterOptions<TFormValues>;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

export function FormInput<TFormValues extends FieldValues>({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  register,
  registerOptions,
  autoComplete,
  className = '',
}: FormInputProps<TFormValues>) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...register(id, registerOptions)}
        className={`appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm ${
          error ? 'border-red-500' : ''
        } ${className}`}
        placeholder={placeholder || label}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p className="text-sm text-red-500" id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
} 
