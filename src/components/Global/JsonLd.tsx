/** Renders one or more JSON-LD blocks as a server-safe <script> tag. */
export default function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return null;

  // Escape "<" so a literal "</script>" inside stringified content can't break out of the tag.
  const json = JSON.stringify(items.length === 1 ? items[0] : items).replace(
    /</g,
    "\\u003c",
  );

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
