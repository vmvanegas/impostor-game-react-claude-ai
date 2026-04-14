import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { RoomState } from '../types';

export function useRoom(roomCode: string | null) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, (snap) => {
      setRoom(snap.val() as RoomState | null);
      setLoading(false);
    });
    return unsub;
  }, [roomCode]);

  return { room, loading };
}
