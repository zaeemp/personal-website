import type { Op } from "./fraction";
import { TIERS, type Tier } from "./daily";

export interface Move {
  a: number; // slot index the result lands in
  b: number; // slot index that empties
  op: Op;
}

export interface TierState {
  moves: Move[];
  status: "playing" | "solved" | "failed";
  startedAt: number | null;
  finishedAt: number | null;
}

export interface TierStats {
  played: number;
  solved: number;
  streak: number;
  best: number;
  lastSolvedDay: number | null;
}

export type DayState = Record<Tier, TierState>;
export type Stats = Record<Tier, TierStats>;

const PREFIX = "cognition:v1";

export const emptyTier = (): TierState => ({
  moves: [],
  status: "playing",
  startedAt: null,
  finishedAt: null,
});

const emptyStats = (): TierStats => ({
  played: 0,
  solved: 0,
  streak: 0,
  best: 0,
  lastSolvedDay: null,
});

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the game still works, it just won't persist.
  }
}

export function loadDay(day: number): DayState {
  const fresh = Object.fromEntries(TIERS.map((t) => [t, emptyTier()])) as DayState;
  return read(`${PREFIX}:day:${day}`, fresh);
}

export function saveDay(day: number, state: DayState) {
  write(`${PREFIX}:day:${day}`, state);
}

export function loadStats(): Stats {
  const fresh = Object.fromEntries(TIERS.map((t) => [t, emptyStats()])) as Stats;
  return read(`${PREFIX}:stats`, fresh);
}

// A streak survives only if yesterday's hand in that tier was solved too.
export function currentStreak(s: TierStats, day: number): number {
  return s.lastSolvedDay !== null && day - s.lastSolvedDay <= 1 ? s.streak : 0;
}

export function recordResult(tier: Tier, day: number, solved: boolean): Stats {
  const stats = loadStats();
  const s = { ...stats[tier] };
  s.played += 1;
  if (solved) {
    s.solved += 1;
    s.streak = s.lastSolvedDay === day - 1 ? s.streak + 1 : 1;
    s.best = Math.max(s.best, s.streak);
    s.lastSolvedDay = day;
  } else {
    s.streak = 0;
  }
  const next = { ...stats, [tier]: s };
  write(`${PREFIX}:stats`, next);
  return next;
}

export function hasSeenHelp(): boolean {
  try {
    return localStorage.getItem(`${PREFIX}:seen-help`) === "1";
  } catch {
    return true;
  }
}

export function markHelpSeen() {
  write(`${PREFIX}:seen-help`, 1);
}
