import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import { RoomState } from '../../types';

interface OnlineWordRevealProps {
  room: RoomState;
  roomCode: string;
  playerId: string;
}

export default function OnlineWordReveal({ room, roomCode, playerId }: OnlineWordRevealProps) {
  const [revealed, setRevealed] = useState(false);

  const myPlayer = room.players[playerId];
  const players = Object.values(room.players || {});
  const revealedCount = players.filter((p) => p.wordRevealed).length;
  const totalPlayers = players.length;
  const allRevealed = revealedCount === totalPlayers;

  const handleReveal = () => setRevealed(true);

  const handleConfirm = async () => {
    await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { wordRevealed: true });
  };

  if (!myPlayer) return null;

  // Already confirmed — waiting for others
  if (myPlayer.wordRevealed) {
    return (
      <div className="screen">
        <div className="reveal-header" style={{ textAlign: 'center' }}>
          <div className="step-badge">Fase de revelación</div>
          <h2 className="phase-title" style={{ marginTop: 16 }}>Ya viste tu palabra</h2>
        </div>

        <div className="word-card" style={{ textAlign: 'center' }}>
          <p className="word-label">Tu palabra secreta es:</p>
          <p className="secret-word">{myPlayer.word}</p>
          <p className={`word-instruction${myPlayer.isImpostor ? ' impostor' : ''}`} style={{ marginTop: 12 }}>
            {myPlayer.isImpostor
              ? room.impostorHint === 'none'     ? '⚠️ ¡Eres el impostor! No tienes pista, ¡buena suerte!'
              : room.impostorHint === 'category' ? '⚠️ ¡Eres el impostor! Esta es la categoría de la palabra.'
              :                                    '⚠️ ¡Eres el impostor! Finge conocer la palabra real.'
              : '✅ Recuerda tu palabra. ¡No la digas!'}
          </p>
        </div>

        <div className="online-waiting-box">
          {allRevealed ? (
            <p>✅ Todos listos. Pasando a discusión...</p>
          ) : (
            <>
              <p className="waiting-msg">
                <span className="waiting-spinner">⏳</span>
                Esperando a los demás jugadores...
              </p>
              <div className="reveal-progress">
                <span className="reveal-progress-text">
                  {revealedCount} / {totalPlayers} jugadores listos
                </span>
                <div className="reveal-progress-bar">
                  <div
                    className="reveal-progress-fill"
                    style={{ width: `${(revealedCount / totalPlayers) * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show reveal UI
  return (
    <div className="screen">
      <div className="reveal-header">
        <div className="step-badge">Fase de revelación</div>
        <h2 className="player-turn">Tu turno,</h2>
        <h1 className="player-name-big">{myPlayer.name}</h1>
      </div>

      {!revealed ? (
        <div className="reveal-area">
          <p className="reveal-instruction">
            Asegúrate de que solo tú puedas ver la pantalla.
          </p>
          <button className="btn btn-primary btn-xl reveal-btn" onClick={handleReveal}>
            <span className="btn-icon">👁️</span>
            Ver mi palabra
          </button>
          <p className="hint">Nadie más debe mirar</p>
        </div>
      ) : (
        <div className="word-shown-area">
          <div className="word-card">
            <p className="word-label">Tu palabra secreta es:</p>
            <p className="secret-word">{myPlayer.word}</p>
          </div>
          <p className={`word-instruction${myPlayer.isImpostor ? ' impostor' : ''}`}>
            {myPlayer.isImpostor
              ? room.impostorHint === 'none'     ? '⚠️ ¡Eres el impostor! No tienes pista, ¡buena suerte!'
              : room.impostorHint === 'category' ? '⚠️ ¡Eres el impostor! Esta es la categoría de la palabra.'
              :                                    '⚠️ ¡Eres el impostor! Finge conocer la palabra real.'
              : '✅ Recuerda tu palabra. ¡No la digas!'}
          </p>
          <button className="btn btn-secondary btn-large" onClick={handleConfirm}>
            Listo ✓
          </button>
        </div>
      )}

      <div className="reveal-progress" style={{ margin: '0 auto', maxWidth: 280 }}>
        <span className="reveal-progress-text">
          {revealedCount} / {totalPlayers} jugadores listos
        </span>
        <div className="reveal-progress-bar">
          <div
            className="reveal-progress-fill"
            style={{ width: `${(revealedCount / totalPlayers) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
