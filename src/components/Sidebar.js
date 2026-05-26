import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/dashboard', label: 'Dashboard',       icon: '◈' },
  { href: '/upload',    label: 'Subir Estado',    icon: '⊕' },
  { href: '/movements', label: 'Movimientos',     icon: '⇌' },
  { href: '/reports',   label: 'Reportes',        icon: '◎' },
  { href: '/settings',  label: 'Configuración',   icon: '⚙' },
];

export default function Sidebar() {
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
        {links.map((link) => {
          const isActive = router.pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href}>
              <a
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-150 border-l-2 ${
                  isActive
                    ? 'text-vault-neon border-vault-neon bg-vault-dark'
                    : 'text-gray-400 border-transparent hover:text-vault-neon hover:bg-vault-dark/50'
                }`}
              >
                <span className="text-lg leading-none">{link.icon}</span>
                {link.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
