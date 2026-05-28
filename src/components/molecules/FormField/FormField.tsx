import React from 'react';
import { Input } from '@/components/atoms/Input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
}) => {
  return (
    <Input
      label={label}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
    />
  );
};
