import { notFound } from "next/navigation";

/** Catch-all for unknown paths — must return a real HTTP 404 (not soft 404). */
export default function CatchAllPage() {
  notFound();
}
