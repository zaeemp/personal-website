// Exact rational arithmetic so 8 / (3 - 8/3) lands on exactly 24.
export interface Frac {
  n: number;
  d: number;
}

export type Op = "+" | "-" | "*" | "/";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function frac(n: number, d = 1): Frac {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

// Returns null for division by zero.
export function apply(a: Frac, op: Op, b: Frac): Frac | null {
  switch (op) {
    case "+":
      return frac(a.n * b.d + b.n * a.d, a.d * b.d);
    case "-":
      return frac(a.n * b.d - b.n * a.d, a.d * b.d);
    case "*":
      return frac(a.n * b.n, a.d * b.d);
    case "/":
      return b.n === 0 ? null : frac(a.n * b.d, a.d * b.n);
  }
}

export function equals(a: Frac, n: number): boolean {
  return a.d === 1 && a.n === n;
}

export function format(a: Frac): string {
  return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
}

export const OP_SYMBOL: Record<Op, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };
