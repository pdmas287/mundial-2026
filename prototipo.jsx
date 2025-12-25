import { useState } from 'react';

// Datos de ejemplo
const partidosEjemplo = [
  { id: 1, fecha: '11 Jun 2026', hora: '17:00', local: 'México', visitante: 'Canadá', grupo: 'A', banderaLocal: '🇲🇽', banderaVisitante: '🇨🇦', sede: 'Ciudad de México' },
  { id: 2, fecha: '11 Jun 2026', hora: '20:00', local: 'Estados Unidos', visitante: 'Colombia', grupo: 'A', banderaLocal: '🇺🇸', banderaVisitante: '🇨🇴', sede: 'Los Angeles' },
  { id: 3, fecha: '12 Jun 2026', hora: '14:00', local: 'Argentina', visitante: 'Nigeria', grupo: 'B', banderaLocal: '🇦🇷', banderaVisitante: '🇳🇬', sede: 'Miami' },
  { id: 4, fecha: '12 Jun 2026', hora: '17:00', local: 'Brasil', visitante: 'Japón', grupo: 'C', banderaLocal: '🇧🇷', banderaVisitante: '🇯🇵', sede: 'Nueva York' },
  { id: 5, fecha: '13 Jun 2026', hora: '20:00', local: 'España', visitante: 'Marruecos', grupo: 'D', banderaLocal: '🇪🇸', banderaVisitante: '🇲🇦', sede: 'Dallas' },
];

const rankingEjemplo = [
  { pos: 1, nombre: 'Carlos Rodríguez', puntos: 156, aciertos: 28, avatar: '👨‍💻' },
  { pos: 2, nombre: 'María González', puntos: 142, aciertos: 25, avatar: '👩‍🎨' },
  { pos: 3, nombre: 'Juan Pérez', puntos: 138, aciertos: 24, avatar: '🧑‍🚀' },
  { pos: 4, nombre: 'Ana Martínez', puntos: 125, aciertos: 22, avatar: '👩‍💼' },
  { pos: 5, nombre: 'Tú', puntos: 118, aciertos: 20, avatar: '⭐', isUser: true },
  { pos: 6, nombre: 'Pedro López', puntos: 112, aciertos: 19, avatar: '🧑‍🔬' },
  { pos: 7, nombre: 'Laura Sánchez', puntos: 98, aciertos: 17, avatar: '👩‍🏫' },
];

export default function Mundial2026App() {
  const [activeTab, setActiveTab] = useState('calendario');
  const [predicciones, setPredicciones] = useState({});
  const [showModal, setShowModal] = useState(null);

  const handlePrediccion = (partidoId, tipo, valor) => {
    setPredicciones(prev => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [tipo]: Math.max(0, parseInt(valor) || 0)
      }
    }));
  };

  const guardarPrediccion = (partidoId) => {
    setShowModal(partidoId);
    setTimeout(() => setShowModal(null), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      fontFamily: "'Outfit', sans-serif",
      color: '#fff'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Orbitron:wght@700;900&display=swap');
        
        * { box-sizing: border-box; }
        
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .gradient-text {
          background: linear-gradient(90deg, #f9d423, #ff4e50);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .tab-active {
          background: linear-gradient(90deg, #f9d423, #ff4e50);
          color: #000;
        }
        
        .btn-predict {
          background: linear-gradient(90deg, #00c9ff, #92fe9d);
          transition: all 0.3s ease;
        }
        .btn-predict:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(0, 201, 255, 0.5);
        }
        
        .score-input {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          width: 60px;
          height: 50px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .score-input:focus {
          outline: none;
          border-color: #f9d423;
          box-shadow: 0 0 15px rgba(249, 212, 35, 0.3);
        }
        
        .rank-row {
          transition: all 0.3s ease;
        }
        .rank-row:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          animation: scaleIn 0.3s ease;
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .trophy-icon {
          font-size: 48px;
          animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '40px' }}>⚽</span>
          <div>
            <h1 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '28px',
              fontWeight: 900,
              margin: 0
            }} className="gradient-text">MUNDIAL 2026</h1>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, letterSpacing: '3px' }}>PREDICCIONES</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="glass" style={{
            padding: '10px 20px',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>118 pts</span>
          </div>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f9d423, #ff4e50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            cursor: 'pointer'
          }}>⭐</div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'calendario', label: '📅 Calendario', icon: '📅' },
          { id: 'predicciones', label: '🎯 Mis Predicciones', icon: '🎯' },
          { id: 'brackets', label: '🏆 Brackets', icon: '🏆' },
          { id: 'ranking', label: '📊 Ranking', icon: '📊' },
          { id: 'premios', label: '🥇 Premios', icon: '🥇' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'tab-active' : 'glass'}
            style={{
              padding: '12px 24px',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === tab.id ? '#000' : '#fff',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: '20px 40px' }}>
        
        {/* Calendario Tab */}
        {activeTab === 'calendario' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '5px' }}>
                Fase de Grupos
              </h2>
              <p style={{ opacity: 0.6 }}>Selecciona un partido para hacer tu predicción</p>
            </div>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {partidosEjemplo.map(partido => (
                <div
                  key={partido.id}
                  className="glass card-hover"
                  style={{
                    padding: '25px',
                    borderRadius: '20px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    gap: '20px'
                  }}
                >
                  {/* Equipo Local */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '15px' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>{partido.local}</p>
                        <p style={{ opacity: 0.5, fontSize: '12px', margin: 0 }}>Grupo {partido.grupo}</p>
                      </div>
                      <span style={{ fontSize: '40px' }}>{partido.banderaLocal}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="score-input"
                      style={{ marginTop: '15px' }}
                      value={predicciones[partido.id]?.local ?? ''}
                      onChange={(e) => handlePrediccion(partido.id, 'local', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Centro - Info del partido */}
                  <div style={{ textAlign: 'center', minWidth: '150px' }}>
                    <p style={{ 
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '12px',
                      opacity: 0.7,
                      marginBottom: '5px'
                    }}>{partido.fecha}</p>
                    <p style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '24px',
                      fontWeight: 900,
                      margin: '10px 0'
                    }}>{partido.hora}</p>
                    <p style={{ fontSize: '11px', opacity: 0.5 }}>📍 {partido.sede}</p>
                    
                    <button
                      className="btn-predict"
                      onClick={() => guardarPrediccion(partido.id)}
                      style={{
                        marginTop: '15px',
                        padding: '10px 25px',
                        borderRadius: '50px',
                        border: 'none',
                        fontWeight: 700,
                        color: '#000',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      GUARDAR
                    </button>
                  </div>

                  {/* Equipo Visitante */}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '40px' }}>{partido.banderaVisitante}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>{partido.visitante}</p>
                        <p style={{ opacity: 0.5, fontSize: '12px', margin: 0 }}>Grupo {partido.grupo}</p>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="score-input"
                      style={{ marginTop: '15px' }}
                      value={predicciones[partido.id]?.visitante ?? ''}
                      onChange={(e) => handlePrediccion(partido.id, 'visitante', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking Tab */}
        {activeTab === 'ranking' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '5px' }}>
                Tabla de Posiciones Global
              </h2>
              <p style={{ opacity: 0.6 }}>Tu posición actual: <span className="gradient-text" style={{ fontWeight: 700 }}>#5 de 1,234 participantes</span></p>
            </div>

            <div className="glass" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 120px 100px',
                padding: '15px 25px',
                background: 'rgba(255, 255, 255, 0.05)',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.7
              }}>
                <span>Pos</span>
                <span>Jugador</span>
                <span style={{ textAlign: 'center' }}>Aciertos</span>
                <span style={{ textAlign: 'right' }}>Puntos</span>
              </div>

              {/* Rows */}
              {rankingEjemplo.map((user, index) => (
                <div
                  key={user.pos}
                  className="rank-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px 100px',
                    padding: '20px 25px',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: user.isUser ? 'rgba(249, 212, 35, 0.1)' : 'transparent'
                  }}
                >
                  <span style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 900,
                    fontSize: user.pos <= 3 ? '24px' : '18px',
                    color: user.pos === 1 ? '#ffd700' : user.pos === 2 ? '#c0c0c0' : user.pos === 3 ? '#cd7f32' : '#fff'
                  }}>
                    {user.pos <= 3 ? ['🥇', '🥈', '🥉'][user.pos - 1] : `#${user.pos}`}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '28px' }}>{user.avatar}</span>
                    <span style={{ fontWeight: user.isUser ? 700 : 500 }}>
                      {user.nombre}
                      {user.isUser && <span style={{ 
                        marginLeft: '10px',
                        padding: '3px 10px',
                        background: 'linear-gradient(90deg, #f9d423, #ff4e50)',
                        borderRadius: '50px',
                        fontSize: '10px',
                        color: '#000',
                        fontWeight: 700
                      }}>TÚ</span>}
                    </span>
                  </div>
                  <span style={{ textAlign: 'center', opacity: 0.7 }}>{user.aciertos}/48</span>
                  <span style={{
                    textAlign: 'right',
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px'
                  }}>{user.puntos}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brackets Tab */}
        {activeTab === 'brackets' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '5px' }}>
                Fase Eliminatoria
              </h2>
              <p style={{ opacity: 0.6 }}>Visualiza el camino hacia la final</p>
            </div>

            <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                gap: '40px', 
                minWidth: '1000px',
                alignItems: 'center'
              }}>
                {/* Octavos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '14px', opacity: 0.6, marginBottom: '10px', textAlign: 'center' }}>OCTAVOS</h3>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="glass" style={{ padding: '15px', borderRadius: '12px', width: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>🇦🇷 Argentina</span>
                        <span style={{ fontWeight: 700 }}>-</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>🇳🇬 Nigeria</span>
                        <span style={{ fontWeight: 700 }}>-</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cuartos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                  <h3 style={{ fontSize: '14px', opacity: 0.6, marginBottom: '10px', textAlign: 'center' }}>CUARTOS</h3>
                  {[1,2].map(i => (
                    <div key={i} className="glass" style={{ padding: '15px', borderRadius: '12px', width: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', opacity: 0.5 }}>
                        <span>Por definir</span>
                        <span>-</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}>
                        <span>Por definir</span>
                        <span>-</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Semifinal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
                  <h3 style={{ fontSize: '14px', opacity: 0.6, marginBottom: '10px', textAlign: 'center' }}>SEMIFINAL</h3>
                  <div className="glass" style={{ padding: '15px', borderRadius: '12px', width: '180px', opacity: 0.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Por definir</span>
                      <span>-</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Por definir</span>
                      <span>-</span>
                    </div>
                  </div>
                </div>

                {/* Final */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '14px', opacity: 0.6, marginBottom: '10px', textAlign: 'center' }}>FINAL</h3>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(249, 212, 35, 0.2), rgba(255, 78, 80, 0.2))',
                    border: '2px solid rgba(249, 212, 35, 0.5)',
                    padding: '20px',
                    borderRadius: '16px',
                    width: '200px',
                    opacity: 0.5
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                      <span className="trophy-icon">🏆</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Por definir</span>
                      <span>-</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Por definir</span>
                      <span>-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premios Tab */}
        {activeTab === 'premios' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '5px' }}>
                Premios Individuales
              </h2>
              <p style={{ opacity: 0.6 }}>Predice los ganadores de los premios del Mundial</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { icon: '🏆', nombre: 'Campeón', descripcion: 'Equipo ganador del Mundial', puntos: 25, color: '#ffd700' },
                { icon: '🥈', nombre: 'Subcampeón', descripcion: 'Equipo finalista', puntos: 15, color: '#c0c0c0' },
                { icon: '⚽', nombre: 'Balón de Oro', descripcion: 'Mejor jugador del torneo', puntos: 20, color: '#ff4e50' },
                { icon: '👟', nombre: 'Bota de Oro', descripcion: 'Máximo goleador', puntos: 20, color: '#00c9ff' },
                { icon: '🧤', nombre: 'Guante de Oro', descripcion: 'Mejor portero', puntos: 15, color: '#92fe9d' },
              ].map((premio, i) => (
                <div
                  key={i}
                  className="glass card-hover"
                  style={{
                    padding: '25px',
                    borderRadius: '20px',
                    borderLeft: `4px solid ${premio.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '36px' }}>{premio.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 700 }}>{premio.nombre}</h3>
                      <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>{premio.descripcion}</p>
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ opacity: 0.7 }}>Tu predicción:</span>
                    <span style={{ fontWeight: 600 }}>Sin seleccionar</span>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      padding: '5px 12px',
                      background: `${premio.color}22`,
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: premio.color
                    }}>+{premio.puntos} pts</span>
                    <button
                      className="btn-predict"
                      style={{
                        padding: '8px 20px',
                        borderRadius: '50px',
                        border: 'none',
                        fontWeight: 600,
                        color: '#000',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      SELECCIONAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predicciones Tab */}
        {activeTab === 'predicciones' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '5px' }}>
                Mis Predicciones
              </h2>
              <p style={{ opacity: 0.6 }}>Historial y estado de tus predicciones</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '10px' }}>Predicciones Realizadas</p>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '48px', fontWeight: 900, margin: 0 }} className="gradient-text">24</p>
                <p style={{ opacity: 0.5, fontSize: '12px' }}>de 64 partidos</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '10px' }}>Aciertos Exactos</p>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '48px', fontWeight: 900, margin: 0, color: '#92fe9d' }}>8</p>
                <p style={{ opacity: 0.5, fontSize: '12px' }}>+40 puntos</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '10px' }}>Aciertos Parciales</p>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '48px', fontWeight: 900, margin: 0, color: '#00c9ff' }}>12</p>
                <p style={{ opacity: 0.5, fontSize: '12px' }}>+48 puntos</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '10px' }}>Puntos Totales</p>
                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '48px', fontWeight: 900, margin: 0, color: '#f9d423' }}>118</p>
                <p style={{ opacity: 0.5, fontSize: '12px' }}>Posición #5</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span style={{ fontSize: '60px', display: 'block', marginBottom: '20px' }}>✅</span>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>¡Predicción Guardada!</h3>
            <p style={{ opacity: 0.7, marginTop: '10px' }}>Buena suerte en este partido</p>
          </div>
        </div>
      )}
    </div>
  );
}
