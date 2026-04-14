import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import { RoomState } from '../../types';

interface OnlineVotingProps {
  room: RoomState;
  roomCode: string;
  playerId: string;
}

export default function OnlineVoting({ room, roomCode, playerId }: OnlineVotingProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const myPlayer = room.players[playerId];
  const players = Object.entries(room.players || {});
  const votedCount = players.filter(([, p]) => p.vote != null).length;
  const totalPlayers = players.length;
  const allVoted = votedCount === totalPlayers;

  // Tally for display
  const tally: Record<string, number> = {};
  players.forEach(([pid]) => { tally[pid] = 0; });
  players.forEach(([, p]) => {
    if (p.vote) tally[p.vote] = (tally[p.vote] ?? 0) + 1;
  });
  const maxVotes = Math.max(0, ...Object.values(tally));

  const handleVote = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { vote: selected });
    setSubmitting(false);
  };

  if (!myPlayer) return null;

  // Already voted — show waiting screen
  if (myPlayer.vote != null) {
    return (
      <div className="screen">
        <div className="voting-header">
          <h2 className="phase-title">Votaste</h2>
          <p className="phase-subtitle">
            Tu voto por <strong style={{ color: 'var(--purple-light)' }}>
              {room.players[myPlayer.vote]?.name ?? '?'}
            </strong> está registrado.
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Votos en tiempo real</h3>
          <div className="tally-list">
            {players
              .slice()
              .sort(([a], [b]) => tally[b] - tally[a])
              .map(([pid, p]) => {
                const count = tally[pid] ?? 0;
                const isLeading = count === maxVotes && maxVotes > 0;
                return (
                  <div key={pid} className={`tally-row ${isLeading ? 'leading' : ''}`}>
                    <span className="tally-avatar">{p.name[0].toUpperCase()}</span>
                    <span className="tally-name">{p.name}</span>
                    <div className="tally-bar-wrap">
                      <div
                        className="tally-bar"
                        style={{ width: `${maxVotes > 0 ? (count / maxVotes) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="tally-count">{count} {count === 1 ? 'voto' : 'votos'}</span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="online-waiting-box">
          {allVoted ? (
            <p>✅ Todos han votado. Revelando resultados...</p>
          ) : (
            <p className="waiting-msg">
              <span className="waiting-spinner">⏳</span>
              {votedCount} / {totalPlayers} votos recibidos...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Voting UI
  return (
    <div className="screen">
      <div className="voting-header">
        <div className="step-badge">
          {votedCount} / {totalPlayers} han votado
        </div>
        <h2 className="phase-title">¿Quién es el impostor?</h2>
        <p className="voter-label">
          <strong>{myPlayer.name}</strong>, vota por quién crees que es el impostor:
        </p>
      </div>

      <div className="candidates-list">
        {players.map(([pid, p]) => {
          if (pid === playerId) return null;
          return (
            <button
              key={pid}
              className={`candidate-card ${selected === pid ? 'selected' : ''}`}
              onClick={() => setSelected(pid)}
            >
              <span className="candidate-avatar">{p.name[0].toUpperCase()}</span>
              <span className="candidate-name">{p.name}</span>
              {selected === pid && <span className="check">✓</span>}
            </button>
          );
        })}
      </div>

      <button
        className="btn btn-primary btn-large"
        onClick={handleVote}
        disabled={selected === null || submitting}
      >
        {submitting ? 'Enviando...' : 'Confirmar voto'}
      </button>
    </div>
  );
}
