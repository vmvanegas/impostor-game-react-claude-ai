import { useState } from 'react';
import Home from './components/Home';
import Setup from './components/Setup';
import WordReveal from './components/WordReveal';
import Discussion from './components/Discussion';
import Voting from './components/Voting';
import Result from './components/Result';
import OnlineGame from './components/online/OnlineGame';
import { Player, Votes, ImpostorHint } from './types';
import './App.css';

type AppMode = 'home' | 'local' | 'online';
type LocalPhase = 'setup' | 'reveal' | 'discussion' | 'voting' | 'result';

export default function App() {
  const [mode, setMode] = useState<AppMode>(
    () => (sessionStorage.getItem('appMode') as AppMode) || 'home'
  );

  const changeMode = (next: AppMode) => {
    if (next === 'home') sessionStorage.removeItem('appMode');
    else sessionStorage.setItem('appMode', next);
    setMode(next);
  };

  // ─── Local game state ───────────────────────────────────────────────────────
  const [phase, setPhase] = useState<LocalPhase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [realWord, setRealWord] = useState('');
  const [impostorWord, setImpostorWord] = useState('');
  const [impostorHint, setImpostorHint] = useState<ImpostorHint>('word');
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [votes, setVotes] = useState<Votes>({});

  const handleStartGame = (shuffledPlayers: Player[], word: string, impWord: string, hint: ImpostorHint) => {
    setPlayers(shuffledPlayers);
    setRealWord(word);
    setImpostorWord(impWord);
    setImpostorHint(hint);
    setCurrentRevealIndex(0);
    setVotes({});
    setPhase('reveal');
  };

  const handlePlayAgain = () => {
    setPlayers([]);
    setRealWord('');
    setImpostorWord('');
    setCurrentRevealIndex(0);
    setVotes({});
    setPhase('setup');
  };

  // ─── Home ───────────────────────────────────────────────────────────────────
  if (mode === 'home') {
    return (
      <div className="app">
        <Home
          onSelectLocal={() => { changeMode('local'); setPhase('setup'); }}
          onSelectOnline={() => changeMode('online')}
        />
      </div>
    );
  }

  // ─── Online mode ─────────────────────────────────────────────────────────────
  if (mode === 'online') {
    return (
      <div className="app">
        <OnlineGame onBack={() => changeMode('home')} />
      </div>
    );
  }

  // ─── Local mode ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {phase === 'setup' && (
        <Setup onStartGame={handleStartGame} onBack={() => changeMode('home')} />
      )}
      {phase === 'reveal' && (
        <WordReveal
          players={players}
          currentIndex={currentRevealIndex}
          impostorHint={impostorHint}
          onNext={() => setCurrentRevealIndex((i) => i + 1)}
          onAllRevealed={() => setPhase('discussion')}
        />
      )}
      {phase === 'discussion' && (
        <Discussion players={players} onGoToVoting={() => setPhase('voting')} />
      )}
      {phase === 'voting' && (
        <Voting
          players={players}
          onVotingComplete={(finalVotes) => { setVotes(finalVotes); setPhase('result'); }}
        />
      )}
      {phase === 'result' && (
        <Result
          players={players}
          votes={votes}
          realWord={realWord}
          impostorWord={impostorWord}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
