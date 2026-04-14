import { useState } from 'react';
import { Player, ImpostorHint } from '../types';

interface WordRevealProps {
  players: Player[];
  currentIndex: number;
  impostorHint: ImpostorHint;
  onNext: () => void;
  onAllRevealed: () => void;
}

export default function WordReveal({ players, currentIndex, impostorHint, onNext, onAllRevealed }: WordRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const player = players[currentIndex];
  const isLast = currentIndex === players.length - 1;

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    setRevealed(false);
    if (isLast) {
      onAllRevealed();
    } else {
      onNext();
    }
  };

  return (
    <div className="screen">
      <div className="reveal-header">
        <div className="step-badge">
          Jugador {currentIndex + 1} / {players.length}
        </div>
        <h2 className="player-turn">Turno de</h2>
        <h1 className="player-name-big">{player.name}</h1>
      </div>

      {!revealed ? (
        <div className="reveal-area">
          <p className="reveal-instruction">
            Asegúrate de que solo tú puedas ver la pantalla.
          </p>
          <button className="btn btn-primary btn-xl reveal-btn" onClick={handleReveal}>
            <span className="btn-icon">👁️</span>
            Ver mi palabra
          </button>
          <p className="hint">Nadie más debe mirar</p>
        </div>
      ) : (
        <div className="word-shown-area">
          <div className="word-card">
            <p className="word-label">Tu palabra secreta es:</p>
            <p className="secret-word">{player.word}</p>
          </div>
          <p className={`word-instruction ${player.isImpostor ? 'impostor' : ''}`}>
            {player.isImpostor
              ? impostorHint === 'none'     ? '⚠️ ¡Eres el impostor! No tienes pista, ¡buena suerte!'
              : impostorHint === 'category' ? '⚠️ ¡Eres el impostor! Esta es la categoría de la palabra.'
              :                               '⚠️ ¡Eres el impostor! Finge conocer la palabra real.'
              : '✅ Recuerda tu palabra. ¡No la digas!'}
          </p>
          <button className="btn btn-secondary btn-large" onClick={handleNext}>
            {isLast ? '¡Todos listos! Empezar discusión' : 'Listo, siguiente jugador →'}
          </button>
        </div>
      )}

      <div className="progress-dots">
        {players.map((_, i) => (
          <span
            key={i}
            className={`dot ${i < currentIndex ? 'done' : i === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
