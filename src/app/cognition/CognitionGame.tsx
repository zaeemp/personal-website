"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlayingCard, { EmptySlot } from "./components/PlayingCard";
import HowToPlayModal from "./components/HowToPlayModal";
import StatsModal, { formatTime, shareText } from "./components/StatsModal";
import { apply, equals, format, frac, OP_SYMBOL, type Frac, type Op } from "./lib/fraction";
import { dailyHand, msUntilTomorrow, TIER_LABEL, TIERS, todayIndex, type DailyHand, type Suit, type Tier } from "./lib/daily";
import {
  hasSeenHelp,
  loadDay,
  loadStats,
  markHelpSeen,
  recordResult,
  saveDay,
  type DayState,
  type Move,
  type Stats,
} from "./lib/storage";
import styles from "./cognition.module.css";

interface Item {
  value: Frac;
  rank?: number;
  suit?: Suit;
  born: number; // move number that created it, to re-trigger its animation
}

function replay(hand: DailyHand, moves: Move[]) {
  const slots: (Item | null)[] = hand.n.map((n, i) => ({ value: frac(n), rank: n, suit: hand.suits[i], born: 0 }));
  const log: string[] = [];
  moves.forEach((m, i) => {
    const a = slots[m.a]!;
    const b = slots[m.b]!;
    const value = apply(a.value, m.op, b.value)!;
    log.push(`${format(a.value)} ${OP_SYMBOL[m.op]} ${format(b.value)} = ${format(value)}`);
    slots[m.a] = { value, born: i + 1 };
    slots[m.b] = null;
  });
  return { slots, log };
}

const OPS: Op[] = ["+", "-", "*", "/"];
const KEY_TO_OP: Record<string, Op> = { "+": "+", "=": "+", "-": "-", "*": "*", x: "*", X: "*", "/": "/" };

// Starts the clock on a hand the first time it's looked at.
function withStart(s: DayState, t: Tier): DayState {
  return s[t].status === "playing" && s[t].startedAt === null
    ? { ...s, [t]: { ...s[t], startedAt: Date.now() } }
    : s;
}

// Rendered client-only (see CognitionClient), so it can read the clock and
// localStorage while initialising state.
export default function CognitionGame() {
  const [init] = useState(() => {
    const d = todayIndex();
    const s = loadDay(d);
    const t = TIERS.find((x) => s[x].status === "playing") ?? "easy";
    return { day: d, state: withStart(s, t), tier: t, help: !hasSeenHelp() };
  });
  const day: number | null = init.day;
  const [state, setState] = useState<DayState | null>(init.state);
  const [stats, setStats] = useState<Stats | null>(loadStats);
  const [tier, setTier] = useState<Tier>(init.tier);
  const [first, setFirst] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [shake, setShake] = useState<{ target: string; n: number } | null>(null);
  const [modal, setModal] = useState<"help" | "stats" | null>(init.help ? "help" : null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const [shared, setShared] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (init.help) markHelpSeen();
  }, [init.help]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // A new day starts at local midnight: reload so the new hands appear.
  useEffect(() => {
    if (day !== null && todayIndex(new Date(now)) !== day) window.location.reload();
  }, [now, day]);

  useEffect(() => {
    if (day !== null && state) saveDay(day, state);
  }, [day, state]);

  const hand = useMemo(() => (day === null ? null : dailyHand(tier, day)), [tier, day]);
  const tierState = state?.[tier];

  const { slots, log } = useMemo(
    () => (hand && tierState ? replay(hand, tierState.moves) : { slots: [], log: [] }),
    [hand, tierState]
  );

  const flash = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const doShake = (target: string) => setShake((s) => ({ target, n: (s?.n ?? 0) + 1 }));

  const clearSelection = () => {
    setFirst(null);
    setOp(null);
  };

  const switchTier = (t: Tier) => {
    setTier(t);
    setState((s) => s && withStart(s, t));
    clearSelection();
    setConfirmGiveUp(false);
  };

  const finish = useCallback(
    (solved: boolean, moves: Move[]) => {
      if (day === null) return;
      setState((s) => s && { ...s, [tier]: { ...s[tier], moves, status: solved ? "solved" : "failed", finishedAt: Date.now() } });
      setStats(recordResult(tier, day, solved));
    },
    [day, tier]
  );

  const playing = tierState?.status === "playing";

  const tapCard = (i: number) => {
    if (!playing || !slots[i] || !tierState) return;
    if (first === null || op === null) {
      setFirst(first === i && op === null ? null : i);
      return;
    }
    if (i === first) {
      setOp(null);
      return;
    }
    const value = apply(slots[first]!.value, op, slots[i]!.value);
    if (!value) {
      doShake(`op-${op}`);
      flash("Can't divide by zero");
      setOp(null);
      return;
    }
    const moves = [...tierState.moves, { a: first, b: i, op }];
    clearSelection();
    const left = slots.filter(Boolean).length - 1;
    if (left === 1) {
      if (equals(value, 24)) {
        finish(true, moves);
        flash("Solved!");
        setTimeout(() => setModal("stats"), 1500);
        return;
      }
      doShake(`card-${first}`);
      flash(`${format(value)} isn't 24. Undo or reset.`);
    }
    setState((s) => s && { ...s, [tier]: { ...s[tier], moves } });
    setFirst(left === 1 ? null : first);
  };

  const tapOp = (o: Op) => {
    if (!playing) return;
    if (first === null) {
      flash("Pick a card first");
      return;
    }
    setOp(op === o ? null : o);
  };

  const undo = () => {
    if (!playing || !tierState?.moves.length) return;
    setState((s) => s && { ...s, [tier]: { ...s[tier], moves: s[tier].moves.slice(0, -1) } });
    clearSelection();
  };

  const reset = () => {
    if (!playing || !tierState?.moves.length) return;
    setState((s) => s && { ...s, [tier]: { ...s[tier], moves: [] } });
    clearSelection();
  };

  const giveUp = () => {
    if (!confirmGiveUp) {
      setConfirmGiveUp(true);
      setTimeout(() => setConfirmGiveUp(false), 3000);
      return;
    }
    setConfirmGiveUp(false);
    clearSelection();
    finish(false, tierState?.moves ?? []);
  };

  const share = async () => {
    if (day === null || !state) return;
    const text = shareText(day, state);
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Share sheet dismissed.
    }
  };

  // Keyboard: 1-4 pick cards, operators, Backspace undo, Escape clear selection.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyRef.current = (e: KeyboardEvent) => {
      if (modal || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key)) tapCard(Number(e.key) - 1);
      else if (KEY_TO_OP[e.key]) {
        e.preventDefault();
        tapOp(KEY_TO_OP[e.key]);
      } else if (e.key === "Backspace") undo();
      else if (e.key === "Escape") clearSelection();
    };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const countdownHms = (() => {
    const s = Math.floor(msUntilTomorrow(new Date(now)) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  })();

  const elapsed =
    tierState?.startedAt != null ? (tierState.finishedAt ?? now) - tierState.startedAt : 0;

  const hint = !playing
    ? null
    : first === null
      ? "Pick a card"
      : op === null
        ? "Pick an operation"
        : "Pick another card";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-foreground" style={{ height: "100dvh" }}>
      {/* top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-white/90 px-3 backdrop-blur sm:px-5">
        <Link href="/projects" aria-label="Back to projects" className="rounded-full p-2 transition-colors hover:bg-[#f0f0f0]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">Cognition</h1>
        <div className="flex items-center">
          <button type="button" onClick={() => setModal("help")} aria-label="How to play" className="rounded-full p-2 transition-colors hover:bg-[#f0f0f0]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M9.4 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.3-2.6 3.8" />
              <circle cx="12" cy="17.2" r=".6" fill="currentColor" />
            </svg>
          </button>
          <button type="button" onClick={() => setModal("stats")} aria-label="Statistics" className="rounded-full p-2 transition-colors hover:bg-[#f0f0f0]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M4 20V12h4v8M10 20V5h4v15M16 20v-6h4v6M3 20h18" />
            </svg>
          </button>
        </div>
      </header>

      {day !== null && state && hand && tierState && stats && (
        <main className="mx-auto flex max-w-md flex-col px-5 pb-10 pt-5">
          {/* difficulty */}
          <div role="tablist" aria-label="Difficulty" className="grid grid-cols-4 rounded-full bg-[#f0f0f0] p-1">
            {TIERS.map((t) => {
              const st = state[t].status;
              return (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={t === tier}
                  onClick={() => switchTier(t)}
                  className={`flex items-center justify-center gap-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                    t === tier ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  {TIER_LABEL[t]}
                  {st === "solved" && <span className="text-[#3d8b5c]">✓</span>}
                  {st === "failed" && <span className="text-[#c8323b]">✕</span>}
                </button>
              );
            })}
          </div>

          {/* target */}
          <div className="mt-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              #{day + 1} · {TIER_LABEL[tier]}
            </p>
            <p className="font-serif text-7xl leading-none tracking-tight sm:text-8xl">24</p>
            <p className="mt-2 font-mono text-xs tabular-nums text-muted">{formatTime(elapsed)}</p>
          </div>

          {/* cards */}
          <div className="mt-6 grid grid-cols-4 gap-2.5 sm:gap-3" style={{ perspective: 800 }}>
            {slots.map((item, i) => {
              const solved = tierState.status === "solved";
              const isShaking = shake?.target === `card-${i}`;
              return item ? (
                <PlayingCard
                  key={`${tier}-${i}-${item.born}-${isShaking ? shake?.n : 0}`}
                  slot={i}
                  value={item.value}
                  rank={item.rank}
                  suit={item.suit}
                  selected={first === i}
                  solved={solved}
                  animate={solved ? "win" : isShaking ? "shake" : item.born === 0 ? "deal" : "pop"}
                  dealDelay={item.born === 0 && !solved && !isShaking ? i * 70 : 0}
                  onClick={() => tapCard(i)}
                />
              ) : (
                <EmptySlot key={`${tier}-${i}-empty`} />
              );
            })}
          </div>

          {/* moves + hint */}
          <div className="mt-5 min-h-[4.5rem] text-center">
            <ol className="space-y-0.5 font-mono text-sm tabular-nums text-foreground/80">
              {log.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
            {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
          </div>

          {playing ? (
            <>
              {/* operation keys */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {OPS.map((o) => {
                  const isShaking = shake?.target === `op-${o}`;
                  return (
                    <button
                      key={`${o}-${isShaking ? shake?.n : 0}`}
                      type="button"
                      onClick={() => tapOp(o)}
                      aria-label={{ "+": "Add", "-": "Subtract", "*": "Multiply", "/": "Divide" }[o]}
                      aria-pressed={op === o}
                      className={`${isShaking ? styles.shake : ""} h-14 rounded-lg text-2xl font-semibold transition-colors ${
                        op === o ? "bg-foreground text-white" : "bg-[#e3e4e8] text-foreground hover:bg-[#d6d7dc]"
                      }`}
                    >
                      {OP_SYMBOL[o]}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={undo}
                  disabled={!tierState.moves.length}
                  className="h-12 rounded-lg bg-[#e3e4e8] text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-[#d6d7dc] disabled:opacity-40"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={!tierState.moves.length}
                  className="h-12 rounded-lg bg-[#e3e4e8] text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-[#d6d7dc] disabled:opacity-40"
                >
                  Reset
                </button>
              </div>
              <button
                type="button"
                onClick={giveUp}
                className="mx-auto mt-6 text-xs text-muted underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {confirmGiveUp ? "Tap again to give up and see an answer" : "Give up"}
              </button>
            </>
          ) : (
            <div className={`${styles.fade} mt-3 rounded-2xl border border-border p-5 text-center`}>
              {tierState.status === "solved" ? (
                <p className="font-serif text-3xl">Solved in {formatTime(elapsed)}</p>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted">One answer</p>
                  <p className="mt-1 font-mono text-2xl">{hand.s[0]} = 24</p>
                </>
              )}
              <p className="mt-2 text-sm text-muted">
                {Math.round(hand.r * 100)}% of players solve this hand · median {hand.t}s
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {TIERS.some((t) => state[t].status === "playing") && (
                  <button
                    type="button"
                    onClick={() => switchTier(TIERS.find((t) => state[t].status === "playing")!)}
                    className="rounded-full border border-foreground px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground hover:text-white"
                  >
                    Play {TIER_LABEL[TIERS.find((t) => state[t].status === "playing")!]} →
                  </button>
                )}
                <button
                  type="button"
                  onClick={share}
                  className="rounded-full bg-[#3d8b5c] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {shared ? "Copied!" : "Share"}
                </button>
              </div>
              <p className="mt-4 text-xs text-muted">
                Next hands in <span className="font-mono tabular-nums">{countdownHms}</span>
              </p>
            </div>
          )}
        </main>
      )}

      {toast && (
        <div
          role="status"
          className={`${styles.fade} pointer-events-none fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-white shadow-lg`}
        >
          {toast}
        </div>
      )}

      {modal === "help" && <HowToPlayModal onClose={() => setModal(null)} />}
      {modal === "stats" && day !== null && state && stats && (
        <StatsModal
          day={day}
          state={state}
          stats={stats}
          countdown={countdownHms}
          onShare={share}
          shared={shared}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
