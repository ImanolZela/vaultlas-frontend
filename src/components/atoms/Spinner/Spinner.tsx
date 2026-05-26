import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', text }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-vault-deep border-t-vault-neon animate-spin`}
      />
      {text && <span className="text-gray-400 text-sm">{text}</span>}
    </div>
  );
};
