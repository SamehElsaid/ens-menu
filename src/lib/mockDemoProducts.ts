/** Locale-aware price for the demo menu — amount first in Arabic (85 ج.م). */
function formatMockPrice(amount: number, isRtl: boolean): string {
  return isRtl ? `${amount} ج.م` : `${amount} EGP`;
}

/** Canonical demo menu products — one image per product across all homepage demos. */
export const MOCK_DEMO_PRODUCT_IDS = [
  "grilledChicken",
  "orangeJuice",
  "cheesecake",
  "potatoWedges",
] as const;

export type MockDemoProductId = (typeof MOCK_DEMO_PRODUCT_IDS)[number];

export const mockDemoProductImages: Record<MockDemoProductId, string> = {
  grilledChicken: "/images/hero/chicken.jpg",
  orangeJuice: "/images/hero/juice.jpg",
  cheesecake: "/images/hero/cheesecake.jpg",
  potatoWedges: "/images/hero/wedges.jpg",
};

export const mockDemoProductPrices: Record<MockDemoProductId, number> = {
  grilledChicken: 85,
  orangeJuice: 35,
  cheesecake: 55,
  potatoWedges: 28,
};

export type MockDemoMenuItem = {
  id: MockDemoProductId;
  name: string;
  price: string;
  priceAmount: number;
  image: string;
};

export type MockDemoChatProduct = {
  id: MockDemoProductId;
  name: string;
  priceAmount: number;
  image: string;
};

/** @deprecated Use `mockDemoProductImages` — kept for existing imports. */
export const heroMockImages = {
  chicken: mockDemoProductImages.grilledChicken,
  juice: mockDemoProductImages.orangeJuice,
  cheesecake: mockDemoProductImages.cheesecake,
  wedges: mockDemoProductImages.potatoWedges,
} as const;

export function getMockDemoProductImage(id: MockDemoProductId): string {
  return mockDemoProductImages[id];
}

/** Standard 3-item CTA / menu-import demo row (chicken, juice, cheesecake). */
export function buildCtaMenuItems(
  names: { item1: string; item2: string; item3: string },
  isRtl: boolean,
): MockDemoMenuItem[] {
  const rows: Array<{ id: MockDemoProductId; name: string }> = [
    { id: "grilledChicken", name: names.item1 },
    { id: "orangeJuice", name: names.item2 },
    { id: "cheesecake", name: names.item3 },
  ];

  return rows.map(({ id, name }) => ({
    id,
    name,
    priceAmount: mockDemoProductPrices[id],
    price: formatMockPrice(mockDemoProductPrices[id], isRtl),
    image: mockDemoProductImages[id],
  }));
}

/** Lena AI hero chat — two turns with consistent product imagery. */
export function buildHeroChatTurns(
  names: {
    item1: string;
    item2: string;
    item3: string;
    item4: string;
  },
  messages: {
    user1: string;
    lina1: string;
    user2: string;
    lina2: string;
  },
) {
  return [
    {
      id: "turn-light",
      userMessage: messages.user1,
      linaMessage: messages.lina1,
      products: [
        {
          id: "cheesecake" as const,
          name: names.item3,
          priceAmount: mockDemoProductPrices.cheesecake,
          image: mockDemoProductImages.cheesecake,
        },
        {
          id: "orangeJuice" as const,
          name: names.item2,
          priceAmount: mockDemoProductPrices.orangeJuice,
          image: mockDemoProductImages.orangeJuice,
        },
      ] satisfies MockDemoChatProduct[],
    },
    {
      id: "turn-spicy",
      userMessage: messages.user2,
      linaMessage: messages.lina2,
      products: [
        {
          id: "grilledChicken" as const,
          name: names.item1,
          priceAmount: mockDemoProductPrices.grilledChicken,
          image: mockDemoProductImages.grilledChicken,
        },
        {
          id: "potatoWedges" as const,
          name: names.item4,
          priceAmount: mockDemoProductPrices.potatoWedges,
          image: mockDemoProductImages.potatoWedges,
        },
      ] satisfies MockDemoChatProduct[],
    },
  ];
}
