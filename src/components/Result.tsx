import { Player, Votes } from '../types';

interface ResultProps {
  players: Player[];
  votes: Votes;
  realWord: string;
  impostorWord: string;
  onPlayAgain: () => void;
}

export default function Result({ players, votes, realWord, impostorWord, onPlayAgain }: ResultProps) {
  const impostor = players.find((p) => p.isImpostor);
  if (!impostor) return null;

  // Tally votes
  const tally: Votes = {};
  players.forEach((p) => { tally[p.id] = 0; });
  Object.values(votes).forEach((accusedId) => {
    tally[accusedId] = (tally[accusedId] ?? 0) + 1;
  });

  const impostorVotes = tally[impostor.id] ?? 0;
  const maxVotes = Math.max(...Object.values(tally));

  // Impostor wins if they did NOT receive the most votes (or tied but not alone on top)
  const impostorWon = impostorVotes < maxVotes;
  // Who got the most votes (could be multiple in a tie)
  const mostVoted = players.filter((p) => tally[p.id] === maxVotes);

  const sortedPlayers = players.slice().sort((a, b) => tally[b.id] - tally[a.id]);

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
            <span className="word-box-value">{realWord}</span>
          </div>
          <div className="word-box-divider">vs</div>
          <div className="word-box impostor-w">
            <span className="word-box-label">Palabra del impostor</span>
            <span className="word-box-value">{impostorWord}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Votaciones finales</h3>
        <div className="tally-list">
          {sortedPlayers.map((p) => {
            const count = tally[p.id] ?? 0;
            const isImpostorRow = p.isImpostor;
            const isLeading = count === maxVotes && maxVotes > 0;
            return (
              <div
                key={p.id}
                className={`tally-row ${isImpostorRow ? 'impostor-row' : ''} ${isLeading ? 'leading' : ''}`}
              >
                <span className="tally-avatar">{p.name[0].toUpperCase()}</span>
                <span className="tally-name">
                  {p.name}
                  {isImpostorRow && <span className="impostor-badge"> 🎭 Impostor</span>}
                </span>
                <div className="tally-bar-wrap">
                  <div
                    className="tally-bar"
                    style={{ width: `${maxVotes > 0 ? (count / maxVotes) * 100 : 0}%` }}
                  />
                </div>
                <span className="tally-count">
                  {count} {count === 1 ? 'voto' : 'votos'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {mostVoted.length > 0 && !impostorWon && (
        <div className="verdict-note">
          Los jugadores votaron mayoritariamente por{' '}
          <strong>{mostVoted.map((p) => p.name).join(' y ')}</strong>.
        </div>
      )}

      <button className="btn btn-primary btn-large" onClick={onPlayAgain}>
        🔄 Jugar de nuevo
      </button>
    </div>
  );
}
