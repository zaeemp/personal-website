import Modal from "./Modal";
import PlayingCard from "./PlayingCard";
import { frac } from "../lib/fraction";

export default function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose}>
      <p className="mt-1 text-lg">Make 24 with all four cards.</p>
      <ul className="mt-5 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
        <li>Use every card exactly once, combining them with + − × ÷.</li>
        <li>
          Tap a card, tap an operation, then tap a second card. The two merge into a new card. Keep going until
          one card is left.
        </li>
        <li>Fractions are allowed along the way, and the hardest hands need them.</li>
        <li>
          A = 1, J = 11, Q = 12, K = 13.
        </li>
      </ul>

      <p className="mt-6 text-sm font-semibold">Example</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <PlayingCard slot={0} value={frac(8)} rank={8} suit="spades" />
        <PlayingCard slot={1} value={frac(3)} rank={3} suit="hearts" />
        <PlayingCard slot={2} value={frac(3)} rank={3} suit="clubs" />
        <PlayingCard slot={3} value={frac(1)} rank={1} suit="diamonds" />
      </div>
      <ol className="mt-4 space-y-1 font-mono text-sm tabular-nums">
        <li>8 − 1 = 7</li>
        <li>7 × 3 = 21</li>
        <li>21 + 3 = 24 ✓</li>
      </ol>

      <div className="mt-6 border-t border-border pt-5 text-[15px] leading-relaxed">
        <p>
          A new hand is dealt in each difficulty every day at midnight. Difficulty comes from how long real
          players take to solve each hand.
        </p>
        <p className="mt-3 text-xs text-muted">
          Keyboard: 1–4 pick cards, + − * / pick operations, Backspace undoes. Solve data from 4nums.com via the{" "}
          <a
            href="https://huggingface.co/datasets/nlile/24-game"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            nlile/24-game
          </a>{" "}
          dataset.
        </p>
      </div>
    </Modal>
  );
}
