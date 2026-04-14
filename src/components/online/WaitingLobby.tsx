import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import { RoomState, ImpostorHint } from '../../types';
import { getRandomWordPair } from '../../data/words';

const HINT_OPTIONS: { value: ImpostorHint; label: string; desc: string }[] = [
  { value: 'none',     label: 'Sin pista',          desc: 'El impostor no recibe ninguna pista' },
  { value: 'category', label: 'Categoría',           desc: 'El impostor ve la categoría de la palabra' },
  { value: 'word',     label: 'Palabra relacionada', desc: 'El impostor ve una palabra parecida' },
];

interface WaitingLobbyProps {
  room: RoomState;
  roomCode: string;
  playerId: string;
  isHost: boolean;
  onLeave: () => void;
}

export default function WaitingLobby({ room, roomCode, playerId, isHost, onLeave }: WaitingLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [impostorHint, setImpostorHint] = useState<ImpostorHint>('word');

  const players = Object.entries(room.players || {});
  const canStart = players.length >= 3;
  const myName = room.players[playerId]?.name ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    if (!canStart || starting) return;
    setStarting(true);
    try {
      const pair = getRandomWordPair();
      const playerIds = Object.keys(room.players);
      const impostorIndex = Math.floor(Math.random() * playerIds.length);

      const lastStarterId = room.startingPlayerId;
      const eligibleStarters = playerIds.filter(pid => pid !== lastStarterId);
      const starterPool = eligibleStarters.length > 0 ? eligibleStarters : playerIds;
      const startingPlayerId = starterPool[Math.floor(Math.random() * starterPool.length)];

      const impostorWordShown =
        impostorHint === 'none'     ? '???' :
        impostorHint === 'category' ? pair.category :
        pair.impostorWord;

      const updates: Record<string, unknown> = {
        [`rooms/${roomCode}/phase`]: 'reveal',
        [`rooms/${roomCode}/realWord`]: pair.word,
        [`rooms/${roomCode}/impostorWord`]: pair.impostorWord,
        [`rooms/${roomCode}/impostorHint`]: impostorHint,
        [`rooms/${roomCode}/startingPlayerId`]: startingPlayerId,
      };

      playerIds.forEach((pid, i) => {
        const isImpostor = i === impostorIndex;
        updates[`rooms/${roomCode}/players/${pid}/word`] = isImpostor ? impostorWordShown : pair.word;
        updates[`rooms/${roomCode}/players/${pid}/isImpostor`] = isImpostor;
        updates[`rooms/${roomCode}/players/${pid}/wordRevealed`] = false;
        updates[`rooms/${roomCode}/players/${pid}/vote`] = null;
      });

      await update(ref(db), updates);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="screen">
      <div className="lobby-header">
        <h1 className="phase-title">Sala de espera</h1>
        <p className="phase-subtitle">Comparte el código con tus amigos</p>
      </div>

      <div className="room-code-card">
        <p className="room-code-label">Código de sala</p>
        <div className="room-code-display">{roomCode}</div>
        <button className="btn btn-secondary" onClick={handleCopy}>
          {copied ? '✅ Copiado' : '📋 Copiar código'}
        </button>
      </div>

      <div className="card">
        <h3 className="section-title">
          Jugadores ({players.length}/8)
          {players.length < 3 && (
            <span className="players-needed"> — faltan {3 - players.length} más</span>
          )}
        </h3>
        <div className="lobby-players-list">
          {players.map(([pid, p]) => (
            <div key={pid} className="lobby-player-row">
              <span className="lobby-player-avatar">{p.name[0].toUpperCase()}</span>
              <span className="lobby-player-name">
                {p.name}
                {pid === playerId && <span className="you-badge"> (tú)</span>}
              </span>
              {pid === room.host && <span className="host-badge">👑 Host</span>}
            </div>
          ))}
        </div>
      </div>

      {isHost && (
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
      )}

      {isHost ? (
        <button
          className="btn btn-primary btn-large"
          onClick={handleStart}
          disabled={!canStart || starting}
        >
          {starting ? 'Iniciando...' : canStart ? '¡Empezar juego!' : `Esperando jugadores (mín. 3)`}
        </button>
      ) : (
        <div className="waiting-msg">
          <span className="waiting-spinner">⏳</span>
          Esperando a que <strong>{room.players[room.host]?.name ?? 'el anfitrión'}</strong> inicie la partida...
        </div>
      )}

      <button className="btn btn-ghost" onClick={onLeave}>
        Salir de la sala
      </button>

      <p className="hint" style={{ textAlign: 'center' }}>
        Hola, <strong style={{ color: 'var(--purple-light)' }}>{myName}</strong>
      </p>
    </div>
  );
}
