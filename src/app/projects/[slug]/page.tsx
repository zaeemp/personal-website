import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const project = getProjectBySlug(slug);
    return { title: project ? `${project.title} - Zaeem Patel` : "Not Found" };
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="py-16">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">
          {project.title}
        </h1>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-muted underline underline-offset-4 transition-colors hover:text-foreground"
          >
            View project &rarr;
          </a>
        )}
      </header>
      <div className="prose prose-neutral mt-10 max-w-none">
        <MDXRemote source={project.content} />
      </div>
      <div className="mt-16">
        <Link
          href="/projects"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          &larr; Back to projects
        </Link>
      </div>
    </article>
  );
}
