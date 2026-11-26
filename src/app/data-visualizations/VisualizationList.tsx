"use client";

import Image from "next/image";
import { Fragment, useState } from "react";
import type { Visualization } from "@/lib/visualizations";
import PencilLine from "./PencilLine";

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const chip = "rounded-full border px-3 py-1 text-xs transition-colors";

export default function VisualizationList({ items }: { items: Visualization[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const tags = [...new Set(items.flatMap((v) => v.tags))].sort();
  const shown = tag ? items.filter((v) => v.tags.includes(tag)) : items;

  if (items.length === 0) {
    return <p className="mt-8 text-sm text-muted">Nothing here yet.</p>;
  }

  return (
    <>
      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          {[null, ...tags].map((t) => {
            const active = tag === t;
            return (
              <button
                key={t ?? "all"}
                type="button"
                onClick={() => setTag(t)}
                aria-pressed={active}
                className={`${chip} ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background/70 text-muted hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {t === null ? "All" : `#${t}`}
              </button>
            );
          })}
        </div>
      )}

      <ul className="mt-10">
        {shown.map((viz, i) => (
          <Fragment key={viz.src}>
            {i > 0 && (
              <li aria-hidden="true" className="py-12">
                <PencilLine />
              </li>
            )}
            <li>
              <figure>
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {viz.date && <time dateTime={viz.date}>{formatDate(viz.date)}</time>}
                  {viz.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className="transition-colors hover:text-foreground"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
                <h2 className="mb-4 font-serif text-2xl tracking-tight">{viz.title}</h2>
                <a href={viz.src} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={viz.src}
                    alt={viz.alt}
                    width={viz.width}
                    height={viz.height}
                    sizes="(max-width: 672px) 100vw, 672px"
                    className="h-auto w-full rounded-lg border border-border"
                  />
                </a>
              </figure>
            </li>
          </Fragment>
        ))}
      </ul>
    </>
  );
}
