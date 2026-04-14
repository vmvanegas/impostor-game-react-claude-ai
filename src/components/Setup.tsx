import { useState } from 'react';
import { getRandomWordPair } from '../data/words';
import { Player, ImpostorHint } from '../types';

interface SetupProps {
  onStartGame: (players: Player[], word: string, impWord: string, impostorHint: ImpostorHint) => void;
  onBack?: () => void;
}

const HINT_OPTIONS: { value: ImpostorHint; label: string; desc: string }[] = [
  { value: 'none',     label: 'Sin pista',          desc: 'El impostor no recibe ninguna pista' },
  { value: 'category', label: 'Categoría',           desc: 'El impostor ve la categoría de la palabra' },
  { value: 'word',     label: 'Palabra relacionada', desc: 'El impostor ve una palabra parecida' },
];

export default function Setup({ onStartGame, onBack }: SetupProps) {
  const [playerNames, setPlayerNames] = useState(['Jugador 1', 'Jugador 2', 'Jugador 3']);
  const [impostorHint, setImpostorHint] = useState<ImpostorHint>('word');
  const [error, setError] = useState('');

  const addPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 3) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index: number, value: string) => {
    const updated = [...playerNames];
    updated[index] = value;
    setPlayerNames(updated);
  };

  const handleStart = () => {
    const trimmed = playerNames.map((n) => n.trim());

    if (trimmed.some((n) => n === '')) {
      setError('Todos los jugadores deben tener un nombre.');
      return;
    }

    const unique = new Set(trimmed.map((n) => n.toLowerCase()));
    if (unique.size !== trimmed.length) {
      setError('Los nombres de los jugadores deben ser únicos.');
      return;
    }

    setError('');

    const pair = getRandomWordPair();
    const impostorIndex = Math.floor(Math.random() * trimmed.length);

    const impostorWordShown =
      impostorHint === 'none'     ? '???' :
      impostorHint === 'category' ? pair.category :
      pair.impostorWord;

    let players: Player[] = trimmed.map((name, i) => ({
      id: i,
      name,
      word: i === impostorIndex ? impostorWordShown : pair.word,
      isImpostor: i === impostorIndex,
    }));

    // Shuffle players so reveal order is random
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    onStartGame(players, pair.word, pair.impostorWord, impostorHint);
  };

  return (
    <div className="screen">
      {onBack && (
        <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={onBack}>
          ← Inicio
        </button>
      )}

      <div className="logo">
        <span className="logo-icon">🕵️</span>
        <h1>Adivina el Impostor</h1>
        <p className="subtitle">¿Quién no sabe la palabra secreta?</p>
      </div>

      <div className="card">
        <h2 className="section-title">Jugadores</h2>
        <p className="hint">Mínimo 3, máximo 8 jugadores</p>

        <div className="players-list">
          {playerNames.map((name, i) => (
            <div key={i} className="player-input-row">
              <div className="player-number">{i + 1}</div>
              <input
                type="text"
                placeholder={`Jugador ${i + 1}`}
                value={name}
                maxLength={20}
                onChange={(e) => updateName(i, e.target.value)}
                className="player-input"
              />
              {playerNames.length > 3 && (
                <button
                  className="remove-btn"
                  onClick={() => removePlayer(i)}
                  aria-label="Eliminar jugador"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {playerNames.length < 8 && (
          <button className="btn btn-secondary" onClick={addPlayer}>
            + Añadir jugador
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Pista para el impostor</h2>
        <p className="hint">¿Qué información recibe el impostor?</p>
        <div className="hint-options">
          {HINT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`hint-option${impostorHint === opt.value ? ' hint-option--active' : ''}`}
              onClick={() => setImpostorHint(opt.value)}
            >
              <span className="hint-option-label">{opt.label}</span>
              <span className="hint-option-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <button className="btn btn-primary btn-large" onClick={handleStart}>
        ¡Empezar juego!
      </button>

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
