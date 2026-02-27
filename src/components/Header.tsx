import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-8">
      <Link
        href="/"
        className="text-sm font-medium tracking-tight text-foreground"
      >
        Zaeem Patel
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/blog"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Blog
        </Link>
        <Link
          href="/projects"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Projects
        </Link>
      </nav>
    </header>
  );
}
