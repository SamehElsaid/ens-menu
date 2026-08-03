export type MockMenuFixture = {
  name: string;
  nameAr: string;
  logo?: string;
  categories: { id: number; name: string; nameAr: string; image?: string }[];
  items: {
    id: number;
    categoryId: number;
    name: string;
    nameAr: string;
    price: number;
    description: string;
    descriptionAr: string;
    image?: string;
  }[];
  social: { facebook?: string; instagram?: string; whatsapp?: string };
  hours: { day: string; open: string; close: string }[];
  phone?: string;
  address?: string;
};

export const MOCK_MENU: MockMenuFixture = {
  name: "Demo Cafe",
  nameAr: "مقهى تجريبي",
  logo: "/ENSd.png",
  categories: [
    { id: 1, name: "Coffee", nameAr: "قهوة", image: "/images/hero/chicken.jpg" },
    { id: 2, name: "Desserts", nameAr: "حلويات" },
    { id: 3, name: "Drinks", nameAr: "مشروبات" },
  ],
  items: [
    {
      id: 101,
      categoryId: 1,
      name: "Cappuccino",
      nameAr: "كابتشينو",
      price: 45,
      description: "Espresso with steamed milk foam",
      descriptionAr: "إسبريسو مع رغوة الحليب",
      image: "/images/hero/chicken.jpg",
    },
    {
      id: 102,
      categoryId: 1,
      name: "Latte",
      nameAr: "لاتيه",
      price: 50,
      description: "Smooth espresso milk drink",
      descriptionAr: "مشروب إسبريسو بالحليب",
    },
    {
      id: 201,
      categoryId: 2,
      name: "Cheesecake",
      nameAr: "تشيز كيك",
      price: 70,
      description: "Creamy classic cheesecake",
      descriptionAr: "تشيز كيك كلاسيك كريمي",
    },
  ],
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    whatsapp: "https://wa.me/201000000000",
  },
  hours: [
    { day: "Sat–Thu", open: "09:00", close: "23:00" },
    { day: "Fri", open: "14:00", close: "23:00" },
  ],
  phone: "+20 100 000 0000",
  address: "Cairo, Egypt",
};
