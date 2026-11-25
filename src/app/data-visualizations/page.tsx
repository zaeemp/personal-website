import Image from "next/image";
import { getAllVisualizations } from "@/lib/visualizations";

export const metadata = {
  title: "Data Visualizations - Zaeem Patel",
};

export default function DataVisualizationsPage() {
  const visualizations = getAllVisualizations();

  return (
    <section className="py-16">
      <h1 className="font-serif text-3xl tracking-tight">Data Visualizations</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Here are some of my favorite data visualizations, created mostly by
        Claude.
      </p>
      {visualizations.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-10 space-y-12">
          {visualizations.map((viz) => (
            <li key={viz.src}>
              <figure>
                <h2 className="mb-4 font-serif text-2xl tracking-tight">
                  {viz.title}
                </h2>
                <a href={viz.src} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={viz.src}
                    alt={viz.alt}
                    width={0}
                    height={0}
                    sizes="(max-width: 672px) 100vw, 672px"
                    className="h-auto w-full rounded-lg border border-border"
                  />
                </a>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
