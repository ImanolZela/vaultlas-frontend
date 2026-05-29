import React from 'react';
import { useRouter } from 'next/router';
import { NavItem } from '@/components/molecules/NavItem';

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '◈' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { href: '/income',  label: 'Ingresos',    icon: '↑' },
      { href: '/expense', label: 'Gastos',       icon: '↓' },
      { href: '/budget',  label: 'Presupuesto',  icon: '◉' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { href: '/reconciliation', label: 'Reconciliación',    icon: '⇄' },
      { href: '/annual-summary', label: 'Resumen Anual',     icon: '◐' },
      { href: '/finance-reports',label: 'Reportes 50-30-20', icon: '▦' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/upload',    label: 'Subir Estado', icon: '⊕' },
      { href: '/documents', label: 'Documentos',   icon: '⇌' },
      { href: '/reports',   label: 'Reportes',     icon: '◎' },
      { href: '/settings',  label: 'Configuración',icon: '⚙' },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const router = useRouter();

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{
        backgroundColor: 'var(--dark-0)',
        borderRight: '1px solid rgba(204,255,0,0.07)',
      }}
    >
      {/* Brand */}
      <div
        className="px-5 py-5 flex items-start justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div>
          <div className="flex items-baseline gap-0.5">
            <span
              className="font-display text-xl tracking-tight"
              style={{
                color: 'var(--neon)',
                textShadow: '0 0 20px rgba(204,255,0,0.35)',
                fontWeight: 800,
              }}
            >
              VAULT
            </span>
            <span
              className="font-display text-xl tracking-tight"
              style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}
            >
              LAS
            </span>
          </div>
          <p
            className="font-mono text-[9px] mt-0.5 tracking-widest uppercase"
            style={{ color: 'rgba(204,255,0,0.3)' }}
          >
            Finance Terminal
          </p>
        </div>

        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors"
            style={{
              color: 'var(--gray)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Cerrar menú"
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>✕</span>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-1">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.label}>
            {/* Section label */}
            <div className={`px-5 ${sIdx > 0 ? 'pt-4' : 'pt-1'} pb-1.5`}>
              <p
                className="font-mono text-[8px] tracking-[0.25em] uppercase select-none"
                style={{ color: 'rgba(204,255,0,0.25)' }}
              >
                {section.label}
              </p>
            </div>
            {/* Divider above section (except first) */}
            {sIdx > 0 && (
              <div
                className="mx-5 mb-2"
                style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }}
              />
            )}
            <div className="space-y-0.5">
              {section.items.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  isActive={router.pathname === link.href || router.pathname.startsWith(link.href + '/')}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p
          className="font-mono text-[9px] tracking-widest uppercase"
          style={{ color: 'rgba(204,255,0,0.2)' }}
        >
          v2026 · BCP Parser
        </p>
      </div>
    </aside>
  );
};
