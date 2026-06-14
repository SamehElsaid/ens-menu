export type CafeLinaCategory = "all" | "drinks" | "bakery" | "food";

export type CafeLinaItem = {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
  descAr: string;
  descEn: string;
  category: Exclude<CafeLinaCategory, "all">;
};

export const CAFE_LINA_MENU: CafeLinaItem[] = [
  {
    id: "cappuccino",
    nameAr: "كابتشينو إيطالي",
    nameEn: "Italian Cappuccino",
    price: 25,
    image: "/images/products/one.jpg",
    descAr: "رغوة غنية وحبوب مختارة",
    descEn: "Rich foam and selected beans",
    category: "drinks",
  },
  {
    id: "croissant",
    nameAr: "كرواسون زبدة",
    nameEn: "Butter Croissant",
    price: 12,
    image: "/images/products/two.jpg",
    descAr: "مخبوز طازج يومياً",
    descEn: "Freshly baked daily",
    category: "bakery",
  },
  {
    id: "margherita",
    nameAr: "بيتزا مارغريتا",
    nameEn: "Margherita Pizza",
    price: 35,
    image: "/images/products/four.jpg",
    descAr: "عجينة إيطالية تقليدية",
    descEn: "Traditional Italian dough",
    category: "food",
  },
  {
    id: "orange-juice",
    nameAr: "عصير برتقال طازج",
    nameEn: "Fresh Orange Juice",
    price: 18,
    image: "/images/products/five.jpg",
    descAr: "برتقال طبيعي 100%",
    descEn: "100% natural orange",
    category: "drinks",
  },
];

export const AI_SUGGESTION_IDS = ["croissant", "cappuccino"] as const;
