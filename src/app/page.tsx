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
      <p className="mt-4 max-w-md leading-relaxed text-muted">
        Fun guy. Working on fun things.
      </p>
      <p className="mt-6 text-sm text-muted">
zaeemp[at]gmail[dot]com
      </p>
    </section>
  );
}
