// Builds src/app/cognition/hands.json from the nlile/24-game dataset
// (https://huggingface.co/datasets/nlile/24-game, Apache-2.0), which carries
// human solve data from 4nums.com. Run once: node scripts/build-cognition-hands.mjs
import fs from "fs";
import path from "path";

const API =
  "https://datasets-server.huggingface.co/rows?dataset=nlile/24-game&config=default&split=train";
const PAGE = 100;
const OUT = path.join(process.cwd(), "src/app/cognition/hands.json");

// Share of hands (easiest first, by adjusted median solve time) in each tier.
const TIERS = [
  ["easy", 0.4],
  ["medium", 0.75],
  ["hard", 0.95],
  ["expert", 1],
];

async function fetchAll() {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${API}&offset=${offset}&length=${PAGE}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} at offset ${offset}`);
    const json = await res.json();
    rows.push(...json.rows.map((r) => r.row));
    if (rows.length >= json.num_rows_total || json.rows.length === 0) break;
  }
  return rows;
}

const rows = (await fetchAll()).filter((r) => r.solvable);
rows.sort((a, b) => a.amt - b.amt || b.solved_rate - a.solved_rate);

const out = Object.fromEntries(TIERS.map(([t]) => [t, []]));
let start = 0;
for (const [tier, upTo] of TIERS) {
  const end = Math.round(rows.length * upTo);
  out[tier] = rows.slice(start, end).map((r) => ({
    n: [...r.numbers].sort((a, b) => a - b),
    s: r.solutions,
    r: Math.round(r.solved_rate * 1000) / 1000,
    t: Math.round(r.amt * 10) / 10,
  }));
  start = end;
}

fs.writeFileSync(OUT, JSON.stringify(out));

console.log(`hands: ${rows.length}`);
for (const [tier] of TIERS) {
  const list = out[tier];
  console.log(
    `${tier.padEnd(6)} ${String(list.length).padStart(4)}  amt ${list[0].t}–${list.at(-1).t}s  solve rate ${list.at(-1).r}–${list[0].r}`
  );
}
const examples = ["2 3 4 6", "1 2 3 8", "1 3 5 7", "4 5 6 7", "1 5 5 5", "3 3 7 7", "2 2 5 9", "1 4 5 6", "3 3 8 8", "1 3 4 6"];
for (const ex of examples) {
  const tier = TIERS.find(([t]) => out[t].some((h) => h.n.join(" ") === ex))?.[0];
  console.log(`  ${ex} -> ${tier ?? "not found"}`);
}
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${fs.statSync(OUT).size} bytes)`);
