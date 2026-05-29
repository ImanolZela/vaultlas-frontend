import React from 'react';
import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ href, label, icon, isActive, onClick }) => {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`relative flex items-center gap-3 mx-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
          isActive ? 'bg-vault-card' : 'hover:bg-white/[0.05]'
        }`}
        style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(204,255,0,0.06)' } : {}}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
            style={{ background: 'var(--neon)', boxShadow: '0 0 8px rgba(204,255,0,0.6)' }}
          />
        )}
        <span
          className="text-base leading-none transition-colors duration-200"
          style={{ color: isActive ? 'var(--neon)' : 'var(--gray-dim)' }}
        >
          {icon}
        </span>
        <span
          className="font-display transition-colors duration-200"
          style={{
            color: isActive ? 'var(--neon)' : 'var(--gray)',
            textShadow: isActive ? '0 0 12px rgba(204,255,0,0.3)' : 'none',
          }}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};
