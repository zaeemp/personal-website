import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-8">
      <Link
        href="/"
        className="whitespace-nowrap text-sm font-medium tracking-tight text-foreground"
      >
        Zaeem Patel
      </Link>
      <nav className="flex gap-5 whitespace-nowrap sm:gap-6">
        <Link
          href="/thoughts"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Thoughts
        </Link>
        <Link
          href="/projects"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Projects
        </Link>
        <Link
          href="/data-visualizations"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Data Viz
        </Link>
        <Link
          href="/resume"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          Resume
        </Link>
      </nav>
    </header>
  );
}
