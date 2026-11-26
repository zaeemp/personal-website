import Modal from "./Modal";
import { TIERS, TIER_LABEL } from "../lib/daily";
import { currentStreak, type DayState, type Stats } from "../lib/storage";

export function formatTime(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function shareText(day: number, state: DayState) {
  const lines = TIERS.map((t) => {
    const s = state[t];
    if (s.status === "solved" && s.startedAt && s.finishedAt) {
      return `🟩 ${TIER_LABEL[t]} ${formatTime(s.finishedAt - s.startedAt)}`;
    }
    if (s.status === "failed") return `🟥 ${TIER_LABEL[t]}`;
    return `⬜ ${TIER_LABEL[t]}`;
  });
  return [`Cognition #${day + 1}`, ...lines, "zaeempatel.com/cognition"].join("\n");
}

export default function StatsModal({
  day,
  state,
  stats,
  countdown,
  onShare,
  shared,
  onClose,
}: {
  day: number;
  state: DayState;
  stats: Stats;
  countdown: string;
  onShare: () => void;
  shared: boolean;
  onClose: () => void;
}) {
  return (
    <Modal title="Statistics" onClose={onClose}>
      <table className="mt-6 w-full text-sm tabular-nums">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted">
            <th className="pb-2 font-medium">Tier</th>
            <th className="pb-2 font-medium">Today</th>
            <th className="pb-2 text-right font-medium">Played</th>
            <th className="pb-2 text-right font-medium">Win %</th>
            <th className="pb-2 text-right font-medium">Streak</th>
            <th className="pb-2 text-right font-medium">Best</th>
          </tr>
        </thead>
        <tbody>
          {TIERS.map((t) => {
            const s = stats[t];
            const today = state[t];
            return (
              <tr key={t} className="border-t border-border">
                <td className="py-2.5 font-medium">{TIER_LABEL[t]}</td>
                <td className="py-2.5">
                  {today.status === "solved" && today.startedAt && today.finishedAt ? (
                    <span className="text-[#3d8b5c]">✓ {formatTime(today.finishedAt - today.startedAt)}</span>
                  ) : today.status === "failed" ? (
                    <span className="text-[#c8323b]">✕</span>
                  ) : (
                    <span className="text-muted">–</span>
                  )}
                </td>
                <td className="py-2.5 text-right">{s.played}</td>
                <td className="py-2.5 text-right">{s.played ? Math.round((s.solved / s.played) * 100) : 0}</td>
                <td className="py-2.5 text-right">{currentStreak(s, day)}</td>
                <td className="py-2.5 text-right">{s.best}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Next hands in</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{countdown}</p>
        </div>
        <button
          type="button"
          onClick={onShare}
          className="rounded-full bg-[#3d8b5c] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {shared ? "Copied!" : "Share"}
        </button>
      </div>
    </Modal>
  );
}
