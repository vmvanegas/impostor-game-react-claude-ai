import { useState } from 'react';
import { Player, Votes } from '../types';

interface VotingProps {
  players: Player[];
  onVotingComplete: (votes: Votes) => void;
}

export default function Voting({ players, onVotingComplete }: VotingProps) {
  const [votes, setVotes] = useState<Votes>({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [phase, setPhase] = useState<'voting' | 'summary'>('voting');

  const currentVoter = players[currentVoterIndex];

  const handleVote = () => {
    if (selectedCandidate === null) return;

    const newVotes: Votes = { ...votes, [currentVoter.id]: selectedCandidate };
    setVotes(newVotes);
    setSelectedCandidate(null);

    if (currentVoterIndex < players.length - 1) {
      setCurrentVoterIndex(currentVoterIndex + 1);
    } else {
      setPhase('summary');
    }
  };

  // Tally votes
  const tally: Votes = {};
  players.forEach((p) => { tally[p.id] = 0; });
  Object.values(votes).forEach((accusedId) => {
    tally[accusedId] = (tally[accusedId] ?? 0) + 1;
  });

  const maxVotes = Math.max(...Object.values(tally));

  if (phase === 'voting') {
    return (
      <div className="screen">
        <div className="voting-header">
          <div className="step-badge">
            Votando {currentVoterIndex + 1} / {players.length}
          </div>
          <h2 className="phase-title">¿Quién es el impostor?</h2>
          <p className="voter-label">
            <strong>{currentVoter.name}</strong>, vota por quién crees que es el impostor:
          </p>
        </div>

        <div className="candidates-list">
          {players.map((p) => {
            if (p.id === currentVoter.id) return null;
            return (
              <button
                key={p.id}
                className={`candidate-card ${selectedCandidate === p.id ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(p.id)}
              >
                <span className="candidate-avatar">{p.name[0].toUpperCase()}</span>
                <span className="candidate-name">{p.name}</span>
                {selectedCandidate === p.id && <span className="check">✓</span>}
              </button>
            );
          })}
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={handleVote}
          disabled={selectedCandidate === null}
        >
          Confirmar voto
        </button>

        <div className="progress-dots">
          {players.map((_, i) => (
            <span
              key={i}
              className={`dot ${i < currentVoterIndex ? 'done' : i === currentVoterIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Summary phase
  return (
    <div className="screen">
      <div className="voting-header">
        <h2 className="phase-title">Resumen de votos</h2>
        <p className="phase-subtitle">Así han votado todos:</p>
      </div>

      <div className="tally-list">
        {players
          .slice()
          .sort((a, b) => tally[b.id] - tally[a.id])
          .map((p) => {
            const count = tally[p.id] ?? 0;
            const isLeading = count === maxVotes && maxVotes > 0;
            return (
              <div key={p.id} className={`tally-row ${isLeading ? 'leading' : ''}`}>
                <span className="tally-avatar">{p.name[0].toUpperCase()}</span>
                <span className="tally-name">{p.name}</span>
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

      <button className="btn btn-primary btn-large" onClick={() => onVotingComplete(votes)}>
        ¡Revelar el impostor! 🎭
      </button>
    </div>
  );
}
