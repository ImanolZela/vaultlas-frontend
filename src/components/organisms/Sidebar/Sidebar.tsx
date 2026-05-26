import React from 'react';
import { useRouter } from 'next/router';
import { NavItem } from '@/components/molecules/NavItem';

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

const links: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard',     icon: '◈' },
  { href: '/upload',    label: 'Subir Estado',  icon: '⊕' },
  { href: '/movements', label: 'Movimientos',   icon: '⇌' },
  { href: '/reports',   label: 'Reportes',      icon: '◎' },
  { href: '/settings',  label: 'Configuración', icon: '⚙' },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <aside
      className="w-56 flex-shrink-0 border-r flex flex-col"
      style={{ backgroundColor: '#0F0F0F', borderColor: 'rgba(204, 255, 0, 0.1)' }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'rgba(204, 255, 0, 0.1)' }}>
        <span className="text-gradient-neon text-2xl font-bold tracking-widest">V</span>
        <span className="text-white text-lg font-semibold ml-1">aultlas</span>
      </div>
      <nav className="flex-1 py-4">
        {links.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            isActive={router.pathname.startsWith(link.href)}
          />
        ))}
      </nav>
    </aside>
  );
};
