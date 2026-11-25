import Link from "next/link";
import { getAllPosts } from "@/lib/thoughts";

export const metadata = {
  title: "Thoughts - Zaeem Patel",
};

export default function ThoughtsPage() {
  const posts = getAllPosts();

  return (
    <section className="py-16">
      <h1 className="font-serif text-3xl tracking-tight">Thoughts</h1>
      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-10 space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/thoughts/${post.slug}`} className="group block">
                <p className="text-sm tabular-nums text-muted">{post.date}</p>
                <p className="mt-1 font-medium group-hover:underline group-hover:underline-offset-4">
                  {post.title}
                </p>
                {post.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {post.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
