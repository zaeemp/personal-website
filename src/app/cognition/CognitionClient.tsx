"use client";

import dynamic from "next/dynamic";

// The game reads the player's clock and localStorage, so skip server rendering.
const CognitionGame = dynamic(() => import("./CognitionGame"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 bg-white" />,
});

export default function CognitionClient() {
  return <CognitionGame />;
}
