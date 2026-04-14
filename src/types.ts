// ─── Shared config types ──────────────────────────────────────────────────────

export type ImpostorHint = 'none' | 'category' | 'word';

// ─── Local game types ────────────────────────────────────────────────────────

export interface Player {
  id: number;
  name: string;
  word: string;
  isImpostor: boolean;
}

export type Votes = Record<number, number>;

// ─── Online game types ────────────────────────────────────────────────────────

export interface OnlinePlayer {
  name: string;
  word: string;
  isImpostor: boolean;
  wordRevealed: boolean;
  vote: string | null; // playerId of the accused, null = not voted yet
}

export type OnlinePhase = 'lobby' | 'reveal' | 'discussion' | 'voting' | 'result';

export interface RoomState {
  host: string;       // playerId of the host
  phase: OnlinePhase;
  realWord: string;
  impostorWord: string;
  impostorHint: ImpostorHint;
  players: Record<string, OnlinePlayer>;
  startingPlayerId?: string; // playerId of who speaks first this round
}
