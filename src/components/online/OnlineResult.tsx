import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import { RoomState } from '../../types';

interface OnlineResultProps {
  room: RoomState;
  roomCode: string;
  isHost: boolean;
}

export default function OnlineResult({ room, roomCode, isHost }: OnlineResultProps) {
  const players = Object.entries(room.players || {});

  // Find impostor
  const impostorEntry = players.find(([, p]) => p.isImpostor);
  if (!impostorEntry) return null;
  const [impostorId, impostor] = impostorEntry;

  // Tally votes
  const tally: Record<string, number> = {};
  players.forEach(([pid]) => { tally[pid] = 0; });
  players.forEach(([, p]) => {
    if (p.vote) tally[p.vote] = (tally[p.vote] ?? 0) + 1;
  });

  const impostorVotes = tally[impostorId] ?? 0;
  const maxVotes = Math.max(0, ...Object.values(tally));
  const impostorWon = impostorVotes < maxVotes;
  const mostVoted = players.filter(([pid]) => tally[pid] === maxVotes);
  const sortedPlayers = players.slice().sort(([a], [b]) => tally[b] - tally[a]);

  const handlePlayAgain = async () => {
    const updates: Record<string, unknown> = {
      [`rooms/${roomCode}/phase`]: 'lobby',
      [`rooms/${roomCode}/realWord`]: '',
      [`rooms/${roomCode}/impostorWord`]: '',
    };
    players.forEach(([pid]) => {
      updates[`rooms/${roomCode}/players/${pid}/word`] = '';
      updates[`rooms/${roomCode}/players/${pid}/isImpostor`] = false;
      updates[`rooms/${roomCode}/players/${pid}/wordRevealed`] = false;
      updates[`rooms/${roomCode}/players/${pid}/vote`] = null;
    });
    await update(ref(db), updates);
  };

  return (
    <div className="screen">
      <div className={`result-banner ${impostorWon ? 'impostor-won' : 'players-won'}`}>
        <div className="result-emoji">{impostorWon ? '🎭' : '🕵️'}</div>
        <h1 className="result-headline">
          {impostorWon ? '¡El impostor escapó!' : '¡Impostor atrapado!'}
        </h1>
        <p className="result-subline">
          {impostorWon
            ? 'El impostor engañó a todos. ¡Gana el impostor!'
            : '¡Los jugadores descubrieron al impostor!'}
        </p>
      </div>

      <div className="card impostor-reveal">
        <p className="reveal-label">El impostor era</p>
        <div className="impostor-name-display">
          <span className="impostor-avatar">{impostor.name[0].toUpperCase()}</span>
          <span className="impostor-name">{impostor.name}</span>
        </div>
        <div className="words-comparison">
          <div className="word-box real">
            <span className="word-box-label">Palabra real</span>
            <span className="word-box-value">{room.realWord}</span>
          </div>
          <div className="word-box-divider">vs</div>
          <div className="word-box impostor-w">
            <span className="word-box-label">Palabra del impostor</span>
            <span className="word-box-value">{room.impostorWord}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Votaciones finales</h3>
        <div className="tally-list">
          {sortedPlayers.map(([pid, p]) => {
            const count = tally[pid] ?? 0;
            const isLeading = count === maxVotes && maxVotes > 0;
            return (
              <div
                key={pid}
                className={`tally-row ${p.isImpostor ? 'impostor-row' : ''} ${isLeading ? 'leading' : ''}`}
              >
                <span className="tally-avatar">{p.name[0].toUpperCase()}</span>
                <span className="tally-name">
                  {p.name}
                  {p.isImpostor && <span className="impostor-badge"> 🎭 Impostor</span>}
                </span>
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

      {mostVoted.length > 0 && !impostorWon && (
        <div className="verdict-note">
          Los jugadores votaron mayoritariamente por{' '}
          <strong>{mostVoted.map(([, p]) => p.name).join(' y ')}</strong>.
        </div>
      )}

      {isHost ? (
        <button className="btn btn-primary btn-large" onClick={handlePlayAgain}>
          🔄 Jugar de nuevo
        </button>
      ) : (
        <div className="waiting-msg">
          <span className="waiting-spinner">⏳</span>
          Esperando al anfitrión para volver a jugar...
        </div>
      )}
    </div>
  );
}
