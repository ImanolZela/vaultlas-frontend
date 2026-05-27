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
        <p className="font-mono text-[10px] font-500 tracking-[0.2em] uppercase mb-4"
           style={{ color: 'rgba(204,255,0,0.55)', letterSpacing: '0.18em' }}>
          {title}
        </p>
      )}
      {children}
    </div>
  );
};
