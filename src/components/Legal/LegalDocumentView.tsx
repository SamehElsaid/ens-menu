import { Link } from "@/i18n/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalDocument = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

type Props = {
  doc: LegalDocument;
  backToHome: string;
  locale: string;
};

export default function LegalDocumentView({ doc, backToHome, locale }: Props) {
  const isRtl = locale === "ar";
  const BackIcon = isRtl ? FiArrowRight : FiArrowLeft;

  return (
    <div className="relative min-h-screen bg-gradient-app">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/15"
          aria-hidden
        />
        <div
          className="absolute top-24 right-0 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl dark:bg-purple-400/10"
          aria-hidden
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-16 pt-28 md:pt-32">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-bold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <BackIcon
            className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0"
            aria-hidden
          />
          {backToHome}
        </Link>

        <article className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200/90 bg-white/90 p-8 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-[#0d1117]/90 dark:shadow-purple-950/20 md:p-12">
          <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {doc.title}
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {doc.updated}
            </p>
          </header>

          <div className="space-y-10">
            {doc.sections.map((section) => (
              <section key={section.heading} className="scroll-mt-28">
                <h2 className="mb-3 text-xl font-bold text-purple-600 dark:text-purple-400">
                  {section.heading}
                </h2>
                <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
