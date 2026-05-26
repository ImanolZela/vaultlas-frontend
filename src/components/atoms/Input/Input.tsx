import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-gray-400 text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-dark ${error ? 'border-vault-coral ring-vault-coral' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-vault-coral text-xs">{error}</span>
      )}
    </div>
  );
};
