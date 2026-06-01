'use client';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const now = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #F0F0F0',
      padding: '1rem 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,.05)',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700, fontSize: '1.5rem',
          color: '#1E1E1E', lineHeight: 1.1,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '.8rem', color: '#6B7280', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <p style={{ fontSize: '.78rem', color: '#9CA3AF' }}>{now}</p>
        {actions}
      </div>
    </header>
  );
}
