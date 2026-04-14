import { useState } from 'react';
import { ref, get, push, update } from 'firebase/database';
import { db } from '../../firebase';
import { OnlinePlayer, RoomState } from '../../types';

interface RoomSetupProps {
  onJoined: (roomCode: string, playerId: string) => void;
  onBack: () => void;
}

type View = 'select' | 'create' | 'join';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function generateRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    const snap = await get(ref(db, `rooms/${code}/host`));
    if (!snap.exists()) return code;
  }
  throw new Error('No se pudo generar un código único. Intenta de nuevo.');
}

export default function RoomSetup({ onJoined, onBack }: RoomSetupProps) {
  const [view, setView] = useState<View>('select');
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Escribe tu nombre.'); return; }
    setError('');
    setLoading(true);
    try {
      const code = await generateRoomCode();
      const playersRef = ref(db, `rooms/${code}/players`);
      const newPlayerRef = push(playersRef);
      const playerId = newPlayerRef.key!;

      const player: OnlinePlayer = {
        name: trimmed,
        word: '',
        isImpostor: false,
        wordRevealed: false,
        vote: null,
      };

      const room: RoomState = {
        host: playerId,
        phase: 'lobby',
        realWord: '',
        impostorWord: '',
        players: { [playerId]: player },
      };

      await update(ref(db, `rooms/${code}`), room);
      onJoined(code, playerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear la sala.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const trimmed = name.trim();
    const code = roomCodeInput.trim().toUpperCase();
    if (!trimmed) { setError('Escribe tu nombre.'); return; }
    if (code.length !== 6) { setError('El código debe tener 6 caracteres.'); return; }
    setError('');
    setLoading(true);
    try {
      const roomSnap = await get(ref(db, `rooms/${code}`));
      if (!roomSnap.exists()) {
        setError('Sala no encontrada. Revisa el código.');
        return;
      }
      const room = roomSnap.val() as RoomState;
      if (room.phase !== 'lobby') {
        setError('La partida ya ha comenzado. No puedes unirte.');
        return;
      }
      const playerCount = Object.keys(room.players || {}).length;
      if (playerCount >= 8) {
        setError('La sala está llena (máximo 8 jugadores).');
        return;
      }

      const playersRef = ref(db, `rooms/${code}/players`);
      const newPlayerRef = push(playersRef);
      const playerId = newPlayerRef.key!;

      const player: OnlinePlayer = {
        name: trimmed,
        word: '',
        isImpostor: false,
        wordRevealed: false,
        vote: null,
      };

      await update(ref(db, `rooms/${code}/players/${playerId}`), player);
      onJoined(code, playerId);
    } catch {
      setError('Error al unirse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'select') {
    return (
      <div className="screen">
        <div className="logo">
          <span className="logo-icon">🕵️</span>
          <h1>Adivina el Impostor</h1>
          <p className="subtitle">Modo Online</p>
        </div>

        <div className="online-select-btns">
          <button className="online-action-card" onClick={() => setView('create')}>
            <span className="online-action-icon">➕</span>
            <span className="online-action-title">Crear sala</span>
            <span className="online-action-desc">Genera un código para que otros se unan</span>
          </button>
          <button className="online-action-card" onClick={() => setView('join')}>
            <span className="online-action-icon">🔗</span>
            <span className="online-action-title">Unirse</span>
            <span className="online-action-desc">Introduce el código de sala</span>
          </button>
        </div>

        <button className="btn btn-ghost" onClick={onBack}>← Volver al inicio</button>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="screen">
        <div className="online-form-header">
          <button className="btn-back" onClick={() => { setView('select'); setError(''); }}>←</button>
          <h2>Nueva sala</h2>
        </div>

        <div className="card">
          <label className="input-label">Tu nombre</label>
          <input
            type="text"
            className="player-input"
            placeholder="¿Cómo te llamas?"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? 'Creando sala...' : '✨ Crear sala'}
        </button>
      </div>
    );
  }

  // join view
  return (
    <div className="screen">
      <div className="online-form-header">
        <button className="btn-back" onClick={() => { setView('select'); setError(''); }}>←</button>
        <h2>Unirse a sala</h2>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="input-label">Código de sala</label>
          <input
            type="text"
            className="player-input room-code-input"
            placeholder="XXXXXX"
            value={roomCodeInput}
            maxLength={6}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            autoFocus
          />
        </div>
        <div>
          <label className="input-label">Tu nombre</label>
          <input
            type="text"
            className="player-input"
            placeholder="¿Cómo te llamas?"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
      </div>

      <button
        className="btn btn-primary btn-large"
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? 'Uniéndose...' : '🚀 Unirse'}
      </button>
    </div>
  );
}
