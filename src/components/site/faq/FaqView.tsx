import { getTranslations } from "next-intl/server";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  Accordion,
  Card,
  Container,
  Eyebrow,
  Section,
  SiteAnchorButton,
  type FaqItem,
} from "@/components/site";
import JsonLd from "@/components/Global/JsonLd";
import {
  ENSMENU_SUPPORT_EMAIL,
  ENSMENU_WHATSAPP_URL,
} from "@/lib/contactConstants";

/**
 * FAQ.
 *
 * The answers are the page, so they get the full reading measure and nothing
 * competes with them. Everything is in the HTML whether or not an item is open
 * — `<details>` keeps collapsed content in the document — which is also what
 * makes the FAQPage structured data below honest.
 */

export default async function FaqView() {
  const t = await getTranslations("Landing.faq");
  const tSite = await getTranslations("site.faq");
  const tContact = await getTranslations("Landing.contactPage");
  const items = t.raw("items") as FaqItem[];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />

      <Section
        size="lg"
        className="isolate -mt-(--s-header-h) pt-[calc(var(--s-header-h)+4rem)] pb-0"
      >
        <div aria-hidden className="s-aurora" />
        <Container width="narrow">
          <Eyebrow>{tSite("eyebrow")}</Eyebrow>
          <h1 className="mt-5 text-site-h1">{t("title")}</h1>
          <p className="mt-6 max-w-2xl text-site-lead text-site-fg">
            {t("description")}
          </p>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <div className="s-reveal">
            <Accordion items={items} />
          </div>

          <Card className="s-reveal mt-14 flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-site-h4 font-semibold text-site-ink">
                {tContact("titleBefore")} {tContact("titleHighlight")}
              </h2>
              <p className="mt-1.5 text-site-sm text-site-fg">
                {tContact("supportNote")}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <SiteAnchorButton
                href={ENSMENU_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp className="size-4" aria-hidden />
                {tContact("actions.whatsapp")}
              </SiteAnchorButton>
              <SiteAnchorButton
                href={`mailto:${ENSMENU_SUPPORT_EMAIL}`}
                variant="secondary"
              >
                <FiMail className="size-4" aria-hidden />
                {tContact("actions.email")}
              </SiteAnchorButton>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
