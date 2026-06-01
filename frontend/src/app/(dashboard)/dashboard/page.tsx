'use client';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  FINANCE: 'Analista Financiero',
  PROFESSOR: 'Profesor',
  LOBBYIST: 'Lobbyista',
  SOCIAL_MANAGER: 'Gestor RRSS',
};

const STAT_CARDS = [
  { icon:'💰', label:'Ingresos del período', value:'$24.500.000', change:'+12%', color:'#E82429', bg:'#FEE2E2' },
  { icon:'👥', label:'Seguidores totales',   value:'8.420',        change:'+4.2%', color:'#00C8E0', bg:'#CFFAFE' },
  { icon:'🎓', label:'Cursos activos',       value:'14',           change:'3 nuevos', color:'#7C3AED', bg:'#EDE9FE' },
  { icon:'📋', label:'Licitaciones activas', value:'7',            change:'2 nuevas hoy', color:'#D97706', bg:'#FEF3C7' },
];

const QUICK_LINKS = [
  { href:'/finance',   icon:'💰', title:'Finanzas',        desc:'Ver dashboard financiero',   roles:['ADMIN','FINANCE'] },
  { href:'/social',    icon:'📣', title:'RRSS',            desc:'Métricas y contenido IA',    roles:['ADMIN','SOCIAL_MANAGER'] },
  { href:'/professor', icon:'🎓', title:'Profesores',      desc:'Cursos, notas, asistencia',  roles:['ADMIN','PROFESSOR'] },
  { href:'/tenders',   icon:'📋', title:'Licitaciones',    desc:'Mercado Público en tiempo real', roles:['ADMIN'] },
  { href:'/lobby',     icon:'🤝', title:'Lobbyistas',      desc:'Minutas y seguimiento',       roles:['ADMIN','LOBBYIST'] },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const myLinks = QUICK_LINKS.filter(l => user && l.roles.includes(user.role));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Vista general del sistema"
      />

      <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* Bienvenida */}
        <div style={{
          background:'linear-gradient(135deg, #E82429 0%, #C01C20 100%)',
          borderRadius:16, padding:'1.75rem 2rem', color:'white',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', right:-20, top:-20,
            width:180, height:180, borderRadius:'50%',
            background:'rgba(255,255,255,.06)',
          }}/>
          <div style={{
            position:'absolute', right:60, bottom:-40,
            width:120, height:120, borderRadius:'50%',
            background:'rgba(0,200,224,.12)',
          }}/>
          <p style={{ fontSize:'.875rem', opacity:.85 }}>{greeting},</p>
          <h2 style={{
            fontFamily:'Rajdhani,sans-serif', fontSize:'2rem',
            fontWeight:700, marginTop:4, lineHeight:1.1,
          }}>{user?.name} <span style={{ color:'#00C8E0' }}>👋</span></h2>
          <p style={{ fontSize:'.8rem', opacity:.75, marginTop:6 }}>
            {ROLE_LABEL[user?.role ?? ''] ?? user?.role} — ATOM Capacitaciones
          </p>
          <div style={{
            marginTop:'1.25rem', display:'inline-flex', alignItems:'center', gap:'.5rem',
            background:'rgba(255,255,255,.12)', padding:'.4rem 1rem', borderRadius:999,
            fontSize:'.8rem', backdropFilter:'blur(10px)',
          }}>
            <span style={{ color:'#00C8E0' }}>●</span> Sistema operativo
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1rem' }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize:'.75rem', color:'#6B7280', fontWeight:500 }}>{s.label}</p>
                <p style={{ fontSize:'1.4rem', fontWeight:700, color:'#1E1E1E', fontFamily:'Rajdhani,sans-serif' }}>{s.value}</p>
                <p style={{ fontSize:'.72rem', color: s.color, fontWeight:600, marginTop:2 }}>{s.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div>
          <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.2rem', fontWeight:700, color:'#1E1E1E', marginBottom:'1rem' }}>
            Accesos rápidos
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem' }}>
            {myLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{ textDecoration:'none' }}
              >
                <div style={{
                  background:'white', borderRadius:12, padding:'1.25rem',
                  boxShadow:'0 1px 4px rgba(0,0,0,.07)',
                  border:'1px solid #F0F0F0',
                  transition:'all .2s', cursor:'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E82429';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(232,36,41,.12)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#F0F0F0';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}>
                  <span style={{ fontSize:'1.5rem' }}>{link.icon}</span>
                  <p style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1rem', color:'#1E1E1E', marginTop:'.5rem' }}>
                    {link.title}
                  </p>
                  <p style={{ fontSize:'.75rem', color:'#6B7280', marginTop:2 }}>{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer branding */}
        <div style={{ textAlign:'center', padding:'1rem 0', borderTop:'1px solid #E5E7EB' }}>
          <p style={{ fontSize:'.72rem', color:'#9CA3AF' }}>
            <span style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, color:'#E82429' }}>ATOM</span>{' '}
            Capacitaciones — Personas Capacitando Personas · Panel v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
