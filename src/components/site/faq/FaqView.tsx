import { getTranslations } from "next-intl/server";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  Accordion,
  Col,
  Container,
  Grid,
  PageHeader,
  Section,
  SiteAnchorButton,
  Ticket,
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
 * The answers are the page, so they get the reading measure on eight columns
 * and nothing competes with them. The remaining four hold the escape hatch —
 * "still stuck, talk to a person" — pinned while the questions scroll, because
 * the moment a visitor gives up on the list is the moment they need it, and at
 * the bottom of a long accordion that block has already scrolled past.
 *
 * Everything is in the HTML whether or not an item is open — `<details>` keeps
 * collapsed content in the document — which is also what makes the FAQPage
 * structured data below honest.
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

      <PageHeader
        ticket={tSite("eyebrow")}
        title={t("title")}
        lead={t("description")}
        meta={[{ label: tSite("eyebrow"), value: String(items.length) }]}
      />

      <Section>
        <Container>
          <Grid className="gap-y-12">
            <Col span={8}>
              {/* One reveal for the whole block rather than one per question.
                  The list is data-driven, so a stagger would mean the last
                  question is still arriving while the reader is already inside
                  the first answer.

                  `name` makes the group exclusive, which is what turns the
                  disclosure into this page's signature: opening a question
                  collapses the previous one, both heights animating at once, and
                  the page visibly settles to exactly one answer. The platform
                  does it — genuinely simultaneous, interruptible and free. */}
              <div className="s-reveal">
                <Accordion items={items} name="faq" />
              </div>
            </Col>

            <Col
              span={3}
              start={10}
              className="self-start lg:sticky lg:top-[calc(var(--s-header-h)+3rem)]"
            >
              <div className="s-reveal rounded-site-card border border-site-line bg-site-bg p-6 shadow-site-sm">
                <Ticket className="text-site-brand-text">
                  {tContact("eyebrow")}
                </Ticket>
                <h2 className="mt-4 text-site-h3">
                  {tContact("titleBefore")} {tContact("titleHighlight")}
                </h2>
                <p className="mt-3 text-site-sm text-site-fg">
                  {tContact("supportNote")}
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <SiteAnchorButton
                    href={ENSMENU_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    block
                  >
                    <FaWhatsapp className="size-4" aria-hidden />
                    {tContact("actions.whatsapp")}
                  </SiteAnchorButton>
                  <SiteAnchorButton
                    href={`mailto:${ENSMENU_SUPPORT_EMAIL}`}
                    variant="secondary"
                    block
                  >
                    <FiMail className="size-4" aria-hidden />
                    {tContact("actions.email")}
                  </SiteAnchorButton>
                </div>
              </div>
            </Col>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
