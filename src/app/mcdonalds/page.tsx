import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Big Mac Prices Across Canada | Zaeem Patel",
  description: "An interactive map of Big Mac prices across 1522 McDonald's Canada locations.",
};

export default function McDonaldsPage() {
  return (
    <iframe
      src="/mcdonalds/index.html"
      title="Big Mac Prices Across Canada"
      className="fixed inset-0 z-50 h-screen w-screen border-0"
    />
  );
}
