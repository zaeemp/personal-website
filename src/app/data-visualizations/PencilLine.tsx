// A faint, slightly wobbly hand-drawn rule, like a pencil stroke on paper.
export default function PencilLine() {
  return (
    <svg
      viewBox="0 0 600 8"
      preserveAspectRatio="none"
      className="h-2 w-full text-[#8a8a8a]"
      aria-hidden="true"
    >
      <path
        d="M2 4.6C60 3.4 118 5.2 180 4.1S300 3 362 4.4 482 5.3 540 3.9 590 4.2 598 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M6 4.1C70 4.9 130 3.5 196 4.5S318 4.9 380 3.8 498 3.6 560 4.6 594 4 596 4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
