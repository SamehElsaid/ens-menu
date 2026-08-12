"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCpu,
  FiEdit3,
  FiMaximize,
  FiUploadCloud,
} from "react-icons/fi";
import { Magnetic } from "@/motion/Magnetic";
import { SiteButtonLink } from "../../Button";
import { Col, Container, Grid, Section, SectionHeading } from "../../index";
import { STORY_CHAPTERS } from "./screens";

/**
 * Chapter two of the page: how the paper became the phone.
 *
 * The four steps are the same four steps this section always had — the copy is
 * still `site.how.*` — but each one is now a chapter of a scroll story, and the
 * travelling phone in `StoryPhone` shows the product actually doing it. The
 * chapters read as an ordinary numbered argument with JavaScript off or motion
 * reduced; the lane beside them is only there for the phone to fly into, and
 * collapses when there is no phone to hold.
 */

const ICONS = {
  upload: FiUploadCloud,
  extract: FiCpu,
  review: FiEdit3,
  publish: FiMaximize,
} as const;

export function HomeStory() {
  const t = useTranslations("site.how");
  const s = useTranslations("site.story");
  const locale = useLocale();
  const Arrow = locale === "ar" ? FiArrowLeft : FiArrowRight;

  return (
    <Section
      id="how-it-works"
      tone="default"
      size="none"
      /* The hero already ends in a seam of its own light; a border here would
         draw the join twice. */
      divided={false}
      data-home-section="story"
      data-story="section"
      className="pt-(--s-section-y)"
    >
      <Container>
        <div data-home="section-heading" className="max-w-3xl">
          <SectionHeading
            index={1}
            eyebrow={t("eyebrow")}
            title={t("title")}
            lead={t("lead")}
          />
        </div>

        <Grid className="mt-12 lg:mt-16">
          <Col span={6} data-story="chapters-col">
            <ol className="relative">
              {STORY_CHAPTERS.map(({ id }, index) => {
                const Icon = ICONS[id];
                return (
                  <li
                    key={id}
                    data-story="chapter"
                    data-story-index={index}
                    className="flex flex-col justify-center py-12 lg:min-h-[86svh]"
                  >
                    <div data-story="chapter-inner">
                      <div className="flex items-center gap-3">
                        <span
                          data-story="chapter-mark"
                          className="flex size-11 shrink-0 items-center justify-center rounded-site-control border border-site-brand-line bg-site-brand-tint text-site-brand-text"
                        >
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <p className="s-ticket text-site-brand-text">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <span
                          aria-hidden
                          data-story="chapter-rule"
                          className="h-px flex-1 bg-site-line"
                        />
                      </div>

                      <h3
                        data-story="chapter-title"
                        className="mt-6 text-site-h2"
                      >
                        {t(`${id}.title`)}
                      </h3>
                      <p
                        data-story="chapter-body"
                        className="mt-4 max-w-md text-site-lead text-site-fg"
                      >
                        {t(`${id}.body`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Col>

          {/* The lane the phone flies into. Empty by design: it holds the
              measured position, not content. */}
          <Col span={5} start={8}>
            <div
              aria-hidden
              data-story="lane"
              className="s-story-lane relative hidden h-full lg:block"
            />
          </Col>
        </Grid>

        <div
          data-story="coda"
          className="flex items-center pt-8 pb-(--s-section-y) lg:min-h-[72svh] lg:pt-0"
        >
          <Grid className="w-full">
            <Col span={6}>
              <p data-story="coda-eyebrow" className="s-ticket text-site-brand-text">
                {s("coda.eyebrow")}
              </p>
              <h3 data-story="coda-title" className="mt-4 text-site-h2">
                {s("coda.title")}
              </h3>
              <p
                data-story="coda-body"
                className="mt-4 max-w-md text-site-lead text-site-fg"
              >
                {s("coda.body")}
              </p>
              <div data-story="coda-cta" className="mt-8">
                <Magnetic>
                  <SiteButtonLink href="/auth/register" size="lg">
                    {s("coda.cta")}
                    <Arrow className="s-cta-arrow size-4" aria-hidden />
                  </SiteButtonLink>
                </Magnetic>
              </div>
            </Col>
          </Grid>
        </div>
      </Container>

      {/* Where the light lands after the phone leaves — the seam into the
          venues already running on it. */}
      <div aria-hidden data-story="seam" className="s-home-seam" />
    </Section>
  );
}

export default HomeStory;
