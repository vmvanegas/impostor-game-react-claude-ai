import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import { RoomState } from '../../types';

interface OnlineDiscussionProps {
  room: RoomState;
  roomCode: string;
  isHost: boolean;
}

export default function OnlineDiscussion({ room, roomCode, isHost }: OnlineDiscussionProps) {
  const players = Object.entries(room.players || {});
  const startingPlayerId = room.startingPlayerId;

  const goToVoting = async () => {
    await update(ref(db, `rooms/${roomCode}`), { phase: 'voting' });
  };

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
        {players.map(([pid, p]) => {
          const isStarter = pid === startingPlayerId;
          return (
            <div key={pid} className={`discussion-player-row${isStarter ? ' discussion-player-row--starting' : ''}`}>
              <span className="lobby-player-avatar">{p.name[0].toUpperCase()}</span>
              <span className="lobby-player-name">{p.name}</span>
              {isStarter && <span className="starts-badge">Empieza</span>}
            </div>
          );
        })}
      </div>

      {isHost ? (
        <button className="btn btn-primary btn-large" onClick={goToVoting}>
          Ir a votar →
        </button>
      ) : (
        <div className="waiting-msg">
          <span className="waiting-spinner">⏳</span>
          Esperando a que el anfitrión inicie la votación...
        </div>
      )}
    </div>
  );
}
