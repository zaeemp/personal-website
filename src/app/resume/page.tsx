import type { ReactNode } from "react";

export const metadata = {
  title: "Resume - Zaeem Patel",
  description: "Resume of Zaeem Patel, product manager.",
};

const PDF = "/zaeem-patel-resume.pdf";

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children}
    </a>
  );
}

function B({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
      {children}
    </h2>
  );
}

const MICROSOFT: ReactNode[] = [
  <>
    Led the M365 Office workstream of{" "}
    <Ext href="https://learn.microsoft.com/en-us/microsoft-365/baseline-security-mode/baseline-security-mode-settings?view=o365-worldwide">
      Baseline Security Mode
    </Ext>{" "}
    0-to-1 from discovery to GTM, enabling enterprise admins to safely deploy
    Microsoft&apos;s recommended security policies via AI-powered impact
    previews, usage analytics, and rollout/rollback controls. Drove{" "}
    <B>
      90%+ Fortune 500 adoption, reducing security incidents and cyber
      insurance costs.
    </B>
  </>,
  <>
    Built a multi-agent AI security system: an engineering agent to fix bugs, a
    triage agent for assignment and escalations, and a reporting agent for
    weekly leadership trend reports.{" "}
    <B>
      Reduced overdue security bugs by ~50%, improved SLA by ~15 days, and
      saved 1000+ engineering hours/month.
    </B>
  </>,
  <>
    Drove the creation and rollout of the Office Vulnerability Filter across
    Word, Excel, and PowerPoint to <B>mitigate high-risk OS API exploits</B>.
    Audited legacy API calls, enabled instant config-based blocking without
    release dependencies, and rolled out block-by-default protection{" "}
    <B>to shift Office from reactive to proactive security.</B>
  </>,
  <>
    Designed &ldquo;Mark of the AI,&rdquo; a file-tagging architecture to{" "}
    <B>protect users from prompt-injection risks in AI-generated Office files</B>
    . To unblock near-term mobile access, aligned Copilot, OneDrive, and Office
    teams to ship a v1 folder-based Protected View safeguard.
  </>,
];

const EARLIER: { org: string; role: string; year: string; body: ReactNode }[] = [
  {
    org: "ecobee",
    role: "Product Manager Intern",
    year: "2020",
    body: (
      <>
        Launched{" "}
        <Ext href="https://support.ecobee.com/s/articles/Using-the-Baby-Monitor-feature-on-your-SmartCamera-with-voice-control?language=en_US">
          baby monitoring mode
        </Ext>{" "}
        for the SmartCamera and optimized video alerts and clip length to{" "}
        <B>cut cloud storage cost by 35%.</B>
      </>
    ),
  },
  {
    org: "Loblaw Digital",
    role: "Product Manager Intern",
    year: "2019",
    body: (
      <>
        Designed v1 of a new grocery delivery experience from landing page to
        checkout. Projected to handle <B>25k+ weekly orders</B>.
      </>
    ),
  },
];

export default function ResumePage() {
  return (
    <section className="py-16">
      <div className="flex items-end justify-between gap-6">
        <h1 className="font-serif text-3xl tracking-tight">Resume</h1>
        <a
          href={PDF}
          download="Zaeem Patel Resume.pdf"
          className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          Download PDF &darr;
        </a>
      </div>
      <p className="mt-3 text-sm text-muted">
        Toronto, ON ·{" "}
        <Ext href="https://www.linkedin.com/in/zaeem-patel/">LinkedIn</Ext>
      </p>

      <div className="mt-10 space-y-8">
        <div>
          <SectionTitle>Experience</SectionTitle>
          <div className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="font-medium">
              Microsoft (M365 Office){" "}
              <span className="whitespace-nowrap font-normal text-muted">
                · Product Manager II
              </span>
            </h3>
            <p className="text-xs tabular-nums text-muted">
              Aug 2021 – Feb 2026
            </p>
          </div>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-[#444] marker:text-border">
            {MICROSOFT.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <SectionTitle>Earlier Experience</SectionTitle>
          <ul className="mt-5 space-y-5">
            {EARLIER.map((job) => (
              <li key={job.org}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium">
                    {job.org}{" "}
                    <span className="whitespace-nowrap font-normal text-muted">· {job.role}</span>
                  </h3>
                  <p className="text-xs tabular-nums text-muted">{job.year}</p>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#444]">
                  {job.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionTitle>Toolbox</SectionTitle>
          <dl className="mt-5 space-y-3 text-sm leading-relaxed text-[#444]">
            <div>
              <dt className="inline font-medium text-foreground">Skills: </dt>
              <dd className="inline">
                AI product strategy, GTM strategy, Agentic workflows, LLM evals,
                AI-first prototyping, Experimentation, A/B testing, User &amp;
                market research
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Tools: </dt>
              <dd className="inline">
                Claude Code, Codex, Copilot, Hermes Agent, Figma, Notion,
                Amplitude, SQL, Python, Git
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <SectionTitle>Education</SectionTitle>
            <h3 className="mt-5 font-medium">University of Waterloo</h3>
            <p className="mt-1 text-sm text-[#444]">
              Systems Design Engineering, 2021
            </p>
          </div>
          <div>
            <SectionTitle>Interests</SectionTitle>
            <p className="mt-5 text-sm leading-relaxed text-[#444]">
              Steve Irwin, Fujifilm, Snowboarding, Style as visual language,
              Urban planning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
