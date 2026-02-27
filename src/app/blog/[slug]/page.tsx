import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const post = getPostBySlug(slug);
    return { title: post ? `${post.title} - Zaeem Patel` : "Not Found" };
  });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="py-16">
      <header>
        <p className="text-sm tabular-nums text-muted">{post.date}</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">
          {post.title}
        </h1>
      </header>
      <div className="prose prose-neutral mt-10 max-w-none">
        <MDXRemote source={post.content} />
      </div>
      <div className="mt-16">
        <Link
          href="/blog"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          &larr; Back to blog
        </Link>
      </div>
    </article>
  );
}
