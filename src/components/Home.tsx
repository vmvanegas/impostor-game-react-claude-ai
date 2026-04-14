interface HomeProps {
  onSelectLocal: () => void;
  onSelectOnline: () => void;
}

export default function Home({ onSelectLocal, onSelectOnline }: HomeProps) {
  return (
    <div className="screen">
      <div className="logo">
        <span className="logo-icon">🕵️</span>
        <h1>Adivina el Impostor</h1>
        <p className="subtitle">¿Quién no sabe la palabra secreta?</p>
      </div>

      <div className="mode-cards">
        <button className="mode-card" onClick={onSelectLocal}>
          <span className="mode-card-icon">👥</span>
          <h2 className="mode-card-title">Local</h2>
          <p className="mode-card-desc">
            Todos en el mismo dispositivo.<br />Se pasa el teléfono entre jugadores.
          </p>
        </button>

        <button className="mode-card mode-card-online" onClick={onSelectOnline}>
          <span className="mode-card-icon">🌐</span>
          <h2 className="mode-card-title">Online</h2>
          <p className="mode-card-desc">
            Cada jugador en su propio dispositivo.<br />Únete con un código de sala.
          </p>
        </button>
      </div>

      <div className="rules-card">
        <h3>¿Cómo se juega?</h3>
        <ol>
          <li>Cada jugador ve su palabra en secreto.</li>
          <li>Todos discuten dando pistas sin decir la palabra.</li>
          <li>Votan quién creen que es el impostor.</li>
          <li>¡Se revela quién era el impostor!</li>
        </ol>
      </div>
    </div>
  );
}
