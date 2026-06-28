"use client";

import { useParams } from "next/navigation";
import { KnowledgeBaseInner } from "../page";

/** Extracts the numeric ID from the end of a slug like "default-template-68" → 68 */
function extractIdFromSlug(slug: string): number | undefined {
  const match = slug.match(/(\d+)$/);
  return match ? Number(match[1]) : undefined;
}

export default function KnowledgeBaseArticlePage() {
  const params = useParams<{ slug: string }>();
  const id = params?.slug ? extractIdFromSlug(params.slug) : undefined;

  return <KnowledgeBaseInner initialId={id} />;
}
