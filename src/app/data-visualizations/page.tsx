import { getAllVisualizations } from "@/lib/visualizations";
import VisualizationList from "./VisualizationList";

export const metadata = {
  title: "Data Visualizations - Zaeem Patel",
};

export default function DataVisualizationsPage() {
  return (
    <section className="py-16">
      {/* Subtle dotted-paper background for this page only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.09) 1px, transparent 1.2px)",
          backgroundSize: "18px 18px",
        }}
      />
      <h1 className="font-serif text-3xl tracking-tight">Data Visualizations</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Aiming to put out an insightful data visual every day.
      </p>
      <VisualizationList items={getAllVisualizations()} />
    </section>
  );
}
