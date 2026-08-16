import { describe, expect, it } from "vitest";
import { isValidDocument, type TemplateDocument } from "./types";

describe("canonical TemplateDocument contract", () => {
  it("requires the same published document fields as the public viewer", () => {
    const document: TemplateDocument = {
      id: "tpl_1",
      name: "Cafe",
      nameAr: "مقهى",
      description: "Lunch",
      descriptionAr: "غداء",
      image: "/preview.png",
      slug: "cafe",
      version: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      globalStyles: { colors: { primary: "#7000B5" }, typography: {} },
      root: {
        id: "root",
        type: "section",
        props: {},
        styles: {
          desktop: {
            paddingTop: 16,
            marginLeft: 8,
            top: "0",
            left: "0",
          },
        },
      },
    };

    expect(isValidDocument(document)).toBe(true);
    expect(isValidDocument({ ...document, name: undefined })).toBe(false);
  });
});
