import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

export const metadata = {
  title: "Projects - Zaeem Patel",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <section className="py-16">
      <h1 className="font-serif text-3xl tracking-tight">Projects</h1>
      {projects.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-10 space-y-8">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="border-b border-border pb-8 last:border-0"
            >
              <Link href={`/projects/${project.slug}`} className="group block">
                <p className="font-medium group-hover:underline group-hover:underline-offset-4">
                  {project.title}
                </p>
                {project.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>
                )}
              </Link>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-muted underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  View project &rarr;
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
