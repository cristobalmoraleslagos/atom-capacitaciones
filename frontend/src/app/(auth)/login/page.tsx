'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1E1E1E 0%, #2D2D2D 60%, #1E1E1E 100%)',
    }}>

      {/* Panel izquierdo — branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '3rem',
        background: 'linear-gradient(180deg, #E82429 0%, #C01C20 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Círculos decorativos */}
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', border:'1px solid rgba(255,255,255,.1)', top:-100, left:-100 }}/>
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', border:'1px solid rgba(255,255,255,.07)', bottom:50, right:-80 }}/>

        <div style={{ position:'relative', textAlign:'center', color:'white' }}>
          {/* Logo icon */}
          <div style={{
            width:80, height:80, borderRadius:18, background:'rgba(255,255,255,.15)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2.5rem', fontWeight:800, fontFamily:'Rajdhani,sans-serif',
            margin:'0 auto 1.5rem', backdropFilter:'blur(10px)',
            border:'1px solid rgba(255,255,255,.2)',
          }}>A</div>

          <h1 style={{
            fontFamily:'Rajdhani,sans-serif', fontSize:'3rem', fontWeight:700,
            lineHeight:1, letterSpacing:'.05em',
          }}>ATOM</h1>
          <p style={{ fontSize:'1rem', letterSpacing:'.18em', opacity:.85, marginTop:4 }}>CAPACITACIONES</p>

          <div style={{
            marginTop:'2rem', padding:'.5rem 1.25rem',
            background:'rgba(255,255,255,.12)', borderRadius:999,
            display:'inline-block', backdropFilter:'blur(10px)',
          }}>
            <p style={{ fontSize:'.78rem', letterSpacing:'.1em', opacity:.9 }}>
              PERSONAS CAPACITANDO PERSONAS
            </p>
          </div>

          <div style={{ marginTop:'3rem', display:'flex', flexDirection:'column', gap:'.75rem', textAlign:'left' }}>
            {[
              { icon:'💰', text:'Análisis Financiero' },
              { icon:'📣', text:'Gestión de Redes Sociales' },
              { icon:'🎓', text:'Módulo de Profesores' },
              { icon:'📋', text:'Licitaciones en tiempo real' },
              { icon:'🤝', text:'Seguimiento de Lobbystas' },
            ].map(item => (
              <div key={item.text} style={{ display:'flex', alignItems:'center', gap:'.75rem', opacity:.85 }}>
                <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
                <span style={{ fontSize:'.875rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — form */}
      <div style={{
        width:480, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'2rem',
      }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <div style={{ marginBottom:'2.5rem' }}>
            <h2 style={{
              fontFamily:'Rajdhani,sans-serif', fontSize:'2rem', fontWeight:700,
              color:'white', lineHeight:1.1,
            }}>Iniciar sesión</h2>
            <p style={{ color:'#9CA3AF', fontSize:'.875rem', marginTop:6 }}>
              Accede a tu panel de gestión
            </p>
          </div>

          {/* Banner modo demo */}
          <div style={{
            background:'rgba(0,200,224,.1)', border:'1px solid rgba(0,200,224,.25)',
            borderRadius:10, padding:'.875rem 1rem', marginBottom:'.5rem',
          }}>
            <p style={{ fontSize:'.78rem', fontWeight:700, color:'#00C8E0', marginBottom:4 }}>
              🧪 Modo demo activo
            </p>
            <p style={{ fontSize:'.75rem', color:'#9CA3AF', lineHeight:1.5 }}>
              <span style={{ color:'#E5E7EB' }}>Email:</span> admin@atomcapacitaciones.cl<br/>
              <span style={{ color:'#E5E7EB' }}>Contraseña:</span> Atom2026!
            </p>
            <button
              type="button"
              onClick={() => { setEmail('admin@atomcapacitaciones.cl'); setPassword('Atom2026!'); }}
              style={{
                marginTop:'.5rem', fontSize:'.72rem', fontWeight:600,
                color:'#00C8E0', background:'none', border:'none', cursor:'pointer',
                padding:0, textDecoration:'underline',
              }}
            >
              Autocompletar credenciales →
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, color:'#D1D5DB', marginBottom:6 }}>
                Correo electrónico
              </label>
              <input
                className="atom-input"
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="correo@atomcapacitaciones.cl" required
                style={{ background:'rgba(255,255,255,.07)', borderColor:'rgba(255,255,255,.12)', color:'white' }}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:'.8rem', fontWeight:600, color:'#D1D5DB', marginBottom:6 }}>
                Contraseña
              </label>
              <input
                className="atom-input"
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ background:'rgba(255,255,255,.07)', borderColor:'rgba(255,255,255,.12)', color:'white' }}
              />
            </div>

            {error && (
              <div style={{
                background:'rgba(232,36,41,.15)', border:'1px solid rgba(232,36,41,.3)',
                borderRadius:8, padding:'.75rem 1rem', color:'#FCA5A5', fontSize:'.875rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'.875rem', marginTop:'.5rem', fontSize:'1rem' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>

          <div style={{
            marginTop:'2rem', padding:'1rem', borderRadius:10,
            background:'rgba(0,200,224,.08)', border:'1px solid rgba(0,200,224,.2)',
          }}>
            <p style={{ fontSize:'.75rem', color:'#00C8E0', fontWeight:600, marginBottom:4 }}>
              🔒 Acceso restringido
            </p>
            <p style={{ fontSize:'.72rem', color:'#6B7280' }}>
              Solo usuarios autorizados por ATOM Capacitaciones pueden acceder a este panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
