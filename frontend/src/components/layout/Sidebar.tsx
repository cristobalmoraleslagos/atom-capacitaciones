'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/dashboard',   icon: '🏠', label: 'Dashboard',         roles: ['ADMIN','FINANCE','PROFESSOR','LOBBYIST','SOCIAL_MANAGER'] },
  { href: '/finance',     icon: '💰', label: 'Finanzas',           roles: ['ADMIN','FINANCE'] },
  { href: '/social',      icon: '📣', label: 'Redes Sociales',     roles: ['ADMIN','SOCIAL_MANAGER'] },
  { href: '/professor',   icon: '🎓', label: 'Módulo Profesores',  roles: ['ADMIN','PROFESSOR'] },
  { href: '/tenders',     icon: '📋', label: 'Licitaciones',       roles: ['ADMIN'] },
  { href: '/lobby',       icon: '🤝', label: 'Lobbyistas',         roles: ['ADMIN','LOBBYIST'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const allowed = NAV.filter(n => user && n.roles.includes(user.role));

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1E1E1E 0%, #2D2D2D 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
      borderRight: '1px solid rgba(255,255,255,.06)',
    }}>

      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#E82429',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 800, color: 'white',
            fontFamily: 'Rajdhani, sans-serif',
            letterSpacing: '.05em',
          }}>A</div>
          <div>
            <p style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'white', lineHeight: 1.1 }}>ATOM</p>
            <p style={{ fontSize: '.65rem', color: '#00C8E0', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase' }}>Capacitaciones</p>
          </div>
        </div>
      </div>

      {/* User pill */}
      <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 8, padding: '.6rem .875rem' }}>
          <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'white' }}>{user?.name}</p>
          <p style={{ fontSize: '.7rem', color: '#00C8E0', marginTop: 2 }}>{user?.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem .75rem', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
        {allowed.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${pathname.startsWith(item.href) && item.href !== '/' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.1rem', minWidth: 22 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '.75rem' }}>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '.6rem', borderRadius: 8, border: 'none',
            background: 'rgba(232,36,41,.15)', color: '#FF6B6B',
            fontWeight: 600, fontSize: '.8rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            transition: 'background .2s',
          }}
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
