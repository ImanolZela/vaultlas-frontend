import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  neon?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  neon = false,
  className = '',
}) => {
  return (
    <div className={`${neon ? 'card-neon' : 'card'} ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
