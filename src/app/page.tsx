import Image from "next/image";

export default function Home() {
  return (
    <section className="py-24">
      <Image
        src="/images/zaeem.jpg"
        alt="Zaeem Patel"
        width={128}
        height={128}
        className=""
        priority
      />
      <h1 className="mt-8 font-serif text-4xl tracking-tight">
        Hi, I&apos;m Zaeem
      </h1>
      <div className="mt-6 space-y-1 text-sm text-muted">
        <p>zaeemp[at]gmail[dot]com</p>
        <p>
          <a
            href="https://x.com/zaeem__p"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            @zaeem__p
          </a>
        </p>
      </div>
    </section>
  );
}
