import React from 'react';
import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ href, label, icon, isActive }) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-150 border-l-2 ${
        isActive
          ? 'text-vault-neon border-vault-neon bg-vault-dark'
          : 'text-gray-400 border-transparent hover:text-vault-neon hover:bg-vault-dark/50'
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </Link>
  );
};
