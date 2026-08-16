import { describe, expect, it } from "vitest";
import { resolveOrderCharges } from "./menuOrderCharges";

describe("resolveOrderCharges characterization", () => {
  it("uses stored charge amounts ahead of current menu percentages", () => {
    expect(
      resolveOrderCharges({
        storedItemsSubtotal: 100,
        storedTaxAmount: 10,
        storedServiceAmount: 5,
        storedTaxPercent: 10,
        storedServicePercent: 5,
        menu: {
          taxEnabled: true,
          taxPercent: 20,
          serviceEnabled: true,
          servicePercent: 20,
        },
        deliveryFee: 7,
      }),
    ).toEqual({
      itemsSubtotal: 100,
      taxAmount: 10,
      taxPercent: 10,
      serviceAmount: 5,
      servicePercent: 5,
      deliveryFee: 7,
      grandTotal: 122,
      hasExtraCharges: true,
    });
  });

  it("derives enabled charges when stored amounts are absent", () => {
    const result = resolveOrderCharges({
      storedItemsSubtotal: 19.999,
      menu: {
        taxEnabled: true,
        taxPercent: 14,
        serviceEnabled: true,
        servicePercent: 12,
      },
    });

    expect(result).toMatchObject({
      itemsSubtotal: 20,
      taxAmount: 2.8,
      serviceAmount: 2.4,
      grandTotal: 25.2,
      hasExtraCharges: true,
    });
  });
});
