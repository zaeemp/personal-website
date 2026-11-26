import type { Frac } from "../lib/fraction";
import type { Suit } from "../lib/daily";
import styles from "../cognition.module.css";

const RANK: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
const RED: Suit[] = ["hearts", "diamonds"];

export function SuitIcon({ suit, className }: { suit: Suit; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {suit === "hearts" && (
        <path d="M12 21.5S2 15.2 2 8.7C2 5.6 4.4 3 7.4 3c1.9 0 3.6 1 4.6 2.6C13 4 14.7 3 16.6 3 19.6 3 22 5.6 22 8.7c0 6.5-10 12.8-10 12.8Z" />
      )}
      {suit === "diamonds" && <path d="M12 1.5 19.5 12 12 22.5 4.5 12Z" />}
      {suit === "spades" && (
        <path d="M12 1.8S3 8.6 3 14c0 2.8 2.2 5 4.9 5 1.4 0 2.6-.5 3.4-1.4L10 22.2h4l-1.3-4.6c.8.9 2 1.4 3.4 1.4 2.7 0 4.9-2.2 4.9-5 0-5.4-9-12.2-9-12.2Z" />
      )}
      {suit === "clubs" && (
        <>
          <circle cx="12" cy="7" r="4.3" />
          <circle cx="6.8" cy="13.6" r="4.3" />
          <circle cx="17.2" cy="13.6" r="4.3" />
          <circle cx="12" cy="13" r="2.6" />
          <path d="M11.2 13h1.6l1.5 9.2H9.7Z" />
        </>
      )}
    </svg>
  );
}

function Value({ value, big }: { value: Frac; big?: boolean }) {
  if (value.d === 1) {
    return <span className={big ? "text-4xl sm:text-5xl" : ""}>{value.n}</span>;
  }
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className={big ? "text-2xl sm:text-3xl" : ""}>{value.n}</span>
      <span className="my-1 h-px w-full min-w-6 bg-current" />
      <span className={big ? "text-2xl sm:text-3xl" : ""}>{value.d}</span>
    </span>
  );
}

const SHELL =
  "relative aspect-[5/7] w-full select-none rounded-xl transition-[transform,box-shadow] duration-150 ease-out";

interface Props {
  value: Frac;
  rank?: number; // set for an original card, missing for a combined result
  suit?: Suit;
  selected?: boolean;
  solved?: boolean;
  dealDelay?: number;
  animate?: "deal" | "pop" | "shake" | "win" | null;
  onClick?: () => void;
  slot: number;
}

export default function PlayingCard({
  value,
  rank,
  suit,
  selected,
  solved,
  dealDelay = 0,
  animate,
  onClick,
  slot,
}: Props) {
  const lift = selected ? "-translate-y-2 shadow-[0_10px_24px_rgba(0,0,0,0.18)] ring-2 ring-foreground" : "shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:-translate-y-0.5";
  const anim = animate ? styles[animate] : "";
  const label = rank ? `${RANK[rank] ?? rank} of ${suit}, value ${rank}` : `Result card, value ${value.n}${value.d === 1 ? "" : ` over ${value.d}`}`;

  if (!rank || !suit) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}. Key ${slot + 1}`}
        aria-pressed={selected}
        className={`${SHELL} ${lift} ${anim} flex items-center justify-center border font-mono font-semibold tabular-nums ${
          solved ? "border-[#3d8b5c] bg-[#3d8b5c] text-white" : "border-border bg-white text-foreground"
        }`}
        style={{ animationDelay: `${dealDelay}ms` }}
      >
        <Value value={value} big />
      </button>
    );
  }

  const face = RANK[rank];
  const color = solved ? "text-white" : RED.includes(suit) ? "text-[#c8323b]" : "text-[#1a1a1a]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}. Key ${slot + 1}`}
      aria-pressed={selected}
      className={`${SHELL} ${lift} ${anim} border ${
        solved ? "border-[#3d8b5c] bg-[#3d8b5c]" : "border-[#e6e1d6] bg-[#fffdf8]"
      } ${color}`}
      style={{ animationDelay: `${dealDelay}ms` }}
    >
      {/* corners */}
      <span className="absolute left-2 top-1.5 flex flex-col items-center font-serif leading-none sm:left-2.5 sm:top-2">
        <span className="text-xl sm:text-2xl">{face ?? rank}</span>
        <SuitIcon suit={suit} className="mt-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </span>
      <span className="absolute bottom-1.5 right-2 flex rotate-180 flex-col items-center font-serif leading-none sm:bottom-2 sm:right-2.5">
        <span className="text-xl sm:text-2xl">{face ?? rank}</span>
        <SuitIcon suit={suit} className="mt-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </span>

      {/* centre */}
      {rank === 1 ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <SuitIcon suit={suit} className="h-11 w-11 sm:h-14 sm:w-14" />
          <span className="mt-1 font-mono text-[10px] tabular-nums opacity-60 sm:text-xs">= 1</span>
        </span>
      ) : face ? (
        <span className="absolute inset-x-[29%] inset-y-[22%] flex flex-col items-center justify-center">
          <span className="font-serif text-3xl leading-none sm:text-4xl">{face}</span>
          <SuitIcon suit={suit} className="mt-1 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="mt-1 font-mono text-[9px] tabular-nums opacity-60 sm:text-[11px]">= {rank}</span>
        </span>
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <SuitIcon suit={suit} className="h-9 w-9 sm:h-12 sm:w-12" />
        </span>
      )}
    </button>
  );
}

export function EmptySlot() {
  return <div className="aspect-[5/7] w-full rounded-xl border border-dashed border-border" aria-hidden="true" />;
}
