import { useState } from 'react';
import { Player } from '../types';

interface DiscussionProps {
  players: Player[];
  onGoToVoting: () => void;
}

export default function Discussion({ players, onGoToVoting }: DiscussionProps) {
  const [startingPlayer] = useState<Player>(() => {
    const lastId = sessionStorage.getItem('lastStartingPlayerId');
    const eligible = players.filter(p => String(p.id) !== lastId);
    const pool = eligible.length > 0 ? eligible : players;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    sessionStorage.setItem('lastStartingPlayerId', String(picked.id));
    return picked;
  });

  return (
    <div className="screen">
      <div className="discussion-header">
        <h1 className="phase-title">¡Discutan!</h1>
        <p className="phase-subtitle">
          Cada uno da pistas sobre su palabra sin decirla directamente.<br />
          ¡Descubrid quién es el impostor!
        </p>
      </div>

      <div className="discussion-players-list">
        {players.map((p) => {
          const isStarter = p.id === startingPlayer.id;
          return (
            <div key={p.id} className={`discussion-player-row${isStarter ? ' discussion-player-row--starting' : ''}`}>
              <span className="lobby-player-avatar">{p.name[0].toUpperCase()}</span>
              <span className="lobby-player-name">{p.name}</span>
              {isStarter && <span className="starts-badge">Empieza</span>}
            </div>
          );
        })}
      </div>

      <button className="btn btn-primary btn-large" onClick={onGoToVoting}>
        Ir a votar →
      </button>
    </div>
  );
}
