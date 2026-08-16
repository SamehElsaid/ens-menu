import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ImportDraft } from "@/types/menuImport";
import { buildBulkImportRequestBody } from "./buildBulkCategoriesPayload";
import { normalizeAiResponse } from "./normalizeAiResponse";

describe("menu import payload integration", () => {
  it("retains shared fixture size and variant IDs in separate collections", () => {
    const fixture = JSON.parse(
      readFileSync(
        path.resolve(
          process.cwd(),
          "..",
          "fixtures",
          "option-import-roundtrip.json",
        ),
        "utf8",
      ),
    ) as {
      aiPayload: unknown;
      expected: { sizeId: string; variantId: string };
    };
    const { draft } = normalizeAiResponse(fixture.aiPayload, {
      menuId: "menu-1",
      currency: "EGP",
      locale: "en",
    });
    const item = buildBulkImportRequestBody(draft).categories[0]?.items[0];

    expect(item?.sizes?.[0]?.id).toBe(fixture.expected.sizeId);
    expect(item?.variants?.[0]?.id).toBe(fixture.expected.variantId);
    expect(item?.sizes?.[0]).not.toHaveProperty("labelAr");
    expect(item?.variants?.[0]).not.toHaveProperty("nameAr");
  });

  it("retains persistent option IDs through the API request payload", () => {
    const draft: ImportDraft = {
      menuId: "menu-1",
      currency: "EGP",
      locale: "en",
      categories: [
        {
          id: "category-1",
          nameAr: "مشروبات",
          nameEn: "Drinks",
          flags: [],
          items: [
            {
              id: "item-1",
              nameAr: "قهوة",
              nameEn: "Coffee",
              price: 30,
              isAvailable: true,
              flags: [],
              sizes: [
                {
                  id: "size-stable-id",
                  label: "Large",
                  labelAr: "كبير",
                  labelEn: "Large",
                  price: 40,
                  flags: [],
                },
              ],
              variants: [
                {
                  id: "variant-stable-id",
                  label: "Mint",
                  labelAr: "نعناع",
                  labelEn: "Mint",
                  price: 5,
                  flags: [],
                },
              ],
            },
          ],
        },
      ],
      uncategorizedItems: [],
      stats: {
        categoryCount: 1,
        itemCount: 1,
        variantCount: 1,
        warningCount: 0,
        expandedItemCount: 1,
        missingPriceCount: 0,
        missingNameCount: 0,
      },
      createdAt: "2026-08-15T00:00:00.000Z",
      sourceImage: null,
    };

    expect(
      buildBulkImportRequestBody(draft).categories[0]?.items[0],
    ).toMatchObject({
      price: 30,
      sizes: [
        {
          id: "size-stable-id",
          nameAr: "كبير",
          nameEn: "Large",
          price: 40,
        },
      ],
      variants: [
        {
          id: "variant-stable-id",
          labelAr: "نعناع",
          labelEn: "Mint",
          price: 5,
        },
      ],
    });
    expect(
      buildBulkImportRequestBody(draft).categories[0]?.items[0]?.variants,
    ).toEqual([
      {
        id: "variant-stable-id",
        label: "نعناع",
        labelAr: "نعناع",
        labelEn: "Mint",
        price: 5,
        flags: [],
      },
    ]);
  });

  it("upgrades short legacy option IDs before sending an import payload", () => {
    const draft = {
      menuId: "menu-1",
      currency: "EGP",
      locale: "en",
      categories: [
        {
          id: "category-1",
          nameAr: "مشروبات",
          nameEn: "Drinks",
          flags: [],
          items: [
            {
              id: "item-1",
              nameAr: "قهوة",
              nameEn: "Coffee",
              price: null,
              isAvailable: true,
              flags: [],
              sizes: [
                {
                  id: "7",
                  label: "Large",
                  price: 40,
                  flags: [],
                },
              ],
              variants: [],
            },
          ],
        },
      ],
      uncategorizedItems: [],
      stats: {
        categoryCount: 1,
        itemCount: 1,
        variantCount: 1,
        warningCount: 0,
        expandedItemCount: 1,
        missingPriceCount: 0,
        missingNameCount: 0,
      },
      createdAt: "2026-08-15T00:00:00.000Z",
      sourceImage: null,
    } satisfies ImportDraft;

    const firstId =
      buildBulkImportRequestBody(draft).categories[0]?.items[0]?.sizes?.[0]?.id;
    const secondId =
      buildBulkImportRequestBody(draft).categories[0]?.items[0]?.sizes?.[0]?.id;

    expect(firstId).not.toBe("7");
    expect(firstId).toMatch(/^[A-Za-z][A-Za-z0-9_-]{7,127}$/);
    expect(secondId).toBe(firstId);
  });
});
