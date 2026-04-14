import { useState, useEffect, useRef } from 'react';
import { ref, update, remove, onDisconnect } from 'firebase/database';
import { db } from '../../firebase';
import { useRoom } from '../../hooks/useRoom';
import { OnlinePlayer } from '../../types';
import RoomSetup from './RoomSetup';
import WaitingLobby from './WaitingLobby';
import OnlineWordReveal from './OnlineWordReveal';
import OnlineDiscussion from './OnlineDiscussion';
import OnlineVoting from './OnlineVoting';
import OnlineResult from './OnlineResult';

interface OnlineGameProps {
  onBack: () => void;
}

export default function OnlineGame({ onBack }: OnlineGameProps) {
  const [roomCode, setRoomCode] = useState<string | null>(
    () => sessionStorage.getItem('roomCode')
  );
  const [playerId, setPlayerId] = useState<string | null>(
    () => sessionStorage.getItem('playerId')
  );
  const { room, loading } = useRoom(roomCode);
  const leavingRef = useRef(false);
  const restoringRef = useRef(false);
  const disconnectRef = useRef<ReturnType<typeof onDisconnect> | null>(null);

  const isHost = !!(room && playerId && room.host === playerId);

  // Register onDisconnect handler: if browser closes, Firebase removes the player automatically
  useEffect(() => {
    if (!roomCode || !playerId) return;

    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    const dc = onDisconnect(playerRef);
    dc.remove();
    disconnectRef.current = dc;

    return () => {
      dc.cancel();
    };
  }, [roomCode, playerId]);

  // Auto-transition: reveal → discussion when all players have revealed their word
  useEffect(() => {
    if (!room || !isHost || room.phase !== 'reveal') return;
    const playerList = Object.values(room.players || {});
    if (playerList.length > 0 && playerList.every((p) => p.wordRevealed)) {
      update(ref(db, `rooms/${roomCode}`), { phase: 'discussion' });
    }
  }, [room, isHost, roomCode]);

  // Auto-transition: voting → result when all players have voted
  useEffect(() => {
    if (!room || !isHost || room.phase !== 'voting') return;
    const playerList = Object.values(room.players || {});
    if (playerList.length > 0 && playerList.every((p) => p.vote != null)) {
      update(ref(db, `rooms/${roomCode}`), { phase: 'result' });
    }
  }, [room, isHost, roomCode]);

  // If during a game (non-lobby) the player count drops below 3, host resets to lobby
  useEffect(() => {
    if (!room || !isHost || room.phase === 'lobby') return;
    const playerCount = Object.keys(room.players || {}).length;
    if (playerCount < 3) {
      update(ref(db, `rooms/${roomCode}`), { phase: 'lobby' });
    }
  }, [room, isHost, roomCode]);

  // If the host disconnected (host key no longer in players), the first remaining
  // player promotes themselves to host
  useEffect(() => {
    if (!room || !playerId || loading) return;
    const playerIds = Object.keys(room.players || {});
    if (playerIds.length > 0 && !room.players[room.host] && playerIds[0] === playerId) {
      update(ref(db, `rooms/${roomCode}`), { host: playerId });
    }
  }, [room, playerId, roomCode, loading]);

  // Cache my player data so we can restore it after a page reload
  useEffect(() => {
    if (!room || !playerId) return;
    const myData = room.players[playerId];
    if (myData) {
      sessionStorage.setItem('playerData', JSON.stringify(myData));
    }
  }, [room, playerId]);

  // If I'm no longer in the room, try to restore from cache (page reload),
  // otherwise exit cleanly
  useEffect(() => {
    if (!room || !playerId || loading || leavingRef.current || restoringRef.current) return;
    if (!room.players[playerId]) {
      const cached = sessionStorage.getItem('playerData');
      if (cached) {
        restoringRef.current = true;
        const playerData = JSON.parse(cached) as OnlinePlayer;
        update(ref(db, `rooms/${roomCode}/players/${playerId}`), playerData)
          .catch(() => {
            sessionStorage.removeItem('roomCode');
            sessionStorage.removeItem('playerId');
            sessionStorage.removeItem('playerData');
            onBack();
          })
          .finally(() => { restoringRef.current = false; });
      } else {
        sessionStorage.removeItem('roomCode');
        sessionStorage.removeItem('playerId');
        onBack();
      }
    }
  }, [room, playerId, loading, onBack, roomCode]);

  const handleJoined = (code: string, pid: string) => {
    sessionStorage.setItem('roomCode', code);
    sessionStorage.setItem('playerId', pid);
    setRoomCode(code);
    setPlayerId(pid);
  };

  const handleLeave = async () => {
    leavingRef.current = true;
    // Cancel the onDisconnect handler since we're leaving manually
    if (disconnectRef.current) {
      await disconnectRef.current.cancel();
    }
    if (roomCode && playerId && room) {
      const remainingIds = Object.keys(room.players || {}).filter((id) => id !== playerId);

      if (remainingIds.length === 0) {
        // Last player — delete the whole room
        await remove(ref(db, `rooms/${roomCode}`));
      } else {
        const updates: Record<string, unknown> = {
          [`rooms/${roomCode}/players/${playerId}`]: null,
        };
        // Transfer host if needed
        if (isHost) {
          updates[`rooms/${roomCode}/host`] = remainingIds[0];
        }
        await update(ref(db), updates);
      }
    }
    sessionStorage.removeItem('roomCode');
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('playerData');
    onBack();
  };

  // No room joined yet — show setup
  if (!roomCode || !playerId) {
    return <RoomSetup onJoined={handleJoined} onBack={handleLeave} />;
  }

  // Loading initial room state
  if (loading) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <span style={{ fontSize: 40 }}>⏳</span>
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Conectando...</p>
      </div>
    );
  }

  // Room disappeared
  if (!room) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <span style={{ fontSize: 40 }}>😕</span>
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Sala no encontrada.</p>
        <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={handleLeave}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const sharedProps = { room, roomCode, playerId, isHost };

  switch (room.phase) {
    case 'lobby':
      return <WaitingLobby {...sharedProps} onLeave={handleLeave} />;
    case 'reveal':
      return <OnlineWordReveal {...sharedProps} />;
    case 'discussion':
      return <OnlineDiscussion {...sharedProps} />;
    case 'voting':
      return <OnlineVoting {...sharedProps} />;
    case 'result':
      return <OnlineResult {...sharedProps} />;
    default:
      return null;
  }
}
