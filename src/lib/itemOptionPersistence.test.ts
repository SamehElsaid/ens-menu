import { describe, expect, it, vi } from "vitest";
import {
  createItemSizeRow,
  createItemVariantRow,
  parseEditableItemSizes,
  parseEditableItemVariants,
  serializeItemSizes,
  serializeItemVariants,
} from "./itemOptionPersistence";
import {
  isPersistentOptionId,
  persistentOptionIdForLegacy,
} from "./optionIds";
import { getItemSizes } from "./itemSizes";
import { getItemVariants } from "./itemVariants";
import type { Item } from "@/types/Menu";

describe("item option persistence", () => {
  it("preserves size and variant IDs through an edit roundtrip", () => {
    const sizes = parseEditableItemSizes({
      sizes: [
        { id: "size-existing", nameAr: "صغير", nameEn: "Small", price: 20 },
        { id: "size-existing-42", nameAr: "كبير", nameEn: "Large", price: 30 },
      ],
    });
    const variants = parseEditableItemVariants({
      variants: [
        {
          id: "variant-existing",
          labelAr: "جبنة",
          labelEn: "Cheese",
          price: 5,
        },
      ],
    });

    expect(serializeItemSizes(sizes)).toEqual([
      { id: "size-existing", nameAr: "صغير", nameEn: "Small", price: 20 },
      { id: "size-existing-42", nameAr: "كبير", nameEn: "Large", price: 30 },
    ]);
    expect(serializeItemVariants(variants)).toEqual([
      {
        id: "variant-existing",
        labelAr: "جبنة",
        labelEn: "Cheese",
        price: 5,
      },
    ]);
  });

  it("deterministically maps legacy IDs across editor reopens", () => {
    const item = {
      sizes: [{ id: 42, nameAr: "كبير", nameEn: "Large", price: 30 }],
      variants: [
        { id: "7", labelAr: "جبنة", labelEn: "Cheese", price: 5 },
      ],
    };
    const firstSizes = parseEditableItemSizes(item);
    const secondSizes = parseEditableItemSizes(item);
    const firstVariants = parseEditableItemVariants(item);
    const secondVariants = parseEditableItemVariants(item);

    const sizeId = serializeItemSizes(firstSizes)[0]?.id;
    const variantId = serializeItemVariants(firstVariants)[0]?.id;
    expect(sizeId).toBe(
      persistentOptionIdForLegacy(42, "size:كبير:30"),
    );
    expect(variantId).toBe(
      persistentOptionIdForLegacy("7", "variant:جبنة:5"),
    );
    expect(serializeItemSizes(secondSizes)[0]?.id).toBe(sizeId);
    expect(serializeItemVariants(secondVariants)[0]?.id).toBe(variantId);
    expect(getItemSizes(item as unknown as Item)[0]?.id).toBe(sizeId);
    expect(getItemVariants(item as unknown as Item)[0]?.id).toBe(variantId);
    expect(isPersistentOptionId(sizeId)).toBe(true);
    expect(isPersistentOptionId(variantId)).toBe(true);
  });

  it("generates one stable UUID for each newly-created option", () => {
    const uuid = vi
      .fn<() => string>()
      .mockReturnValueOnce("new-size-id")
      .mockReturnValueOnce("new-variant-id");

    const size = createItemSizeRow(uuid);
    const variant = createItemVariantRow(uuid);

    expect(size.id).toBe("opt_new-size-id");
    expect(variant.id).toBe("opt_new-variant-id");
    expect(serializeItemSizes([{ ...size, price: "12" }])[0]?.id).toBe(
      "opt_new-size-id",
    );
    expect(
      serializeItemVariants([{ ...variant, price: "3" }])[0]?.id,
    ).toBe("opt_new-variant-id");
    expect(uuid).toHaveBeenCalledTimes(2);
  });
});
