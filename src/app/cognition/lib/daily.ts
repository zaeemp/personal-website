import hands from "../hands.json";

export const TIERS = ["easy", "medium", "hard", "expert"] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_LABEL: Record<Tier, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
};

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export interface Hand {
  n: number[]; // card ranks, 1 (A) to 13 (K)
  s: string[]; // known solutions
  r: number; // share of players who solve it
  t: number; // adjusted median solve time, seconds
}

export interface DailyHand extends Hand {
  suits: Suit[];
}

// Puzzle #1 is 26 Nov 2026. Days roll over at the player's local midnight.
const LAUNCH = Date.UTC(2026, 10, 26);
const DAY = 86_400_000;

export function todayIndex(now = new Date()): number {
  const local = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((local - LAUNCH) / DAY));
}

export function msUntilTomorrow(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SEEDS: Record<Tier, number> = { easy: 2401, medium: 2402, hard: 2403, expert: 2404 };
const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

// Each tier walks through a fixed shuffle of its hands, one per day, so a
// hand only repeats once the whole list has been played.
const ORDER = Object.fromEntries(
  TIERS.map((tier) => [tier, shuffle(hands[tier] as Hand[], SEEDS[tier])])
) as Record<Tier, Hand[]>;

export function dailyHand(tier: Tier, day: number): DailyHand {
  const list = ORDER[tier];
  const hand = list[day % list.length];
  const rand = mulberry32(SEEDS[tier] * 100_000 + day);
  const order = shuffle(hand.n, Math.floor(rand() * 1e9));
  return {
    ...hand,
    n: order,
    suits: shuffle(SUITS, Math.floor(rand() * 1e9)),
  };
}
