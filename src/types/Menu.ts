export interface Menu {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug: string;
  logo?: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items?: number;
    categories?: number;
  };
  [key: string]: unknown;
}

export interface MenusResponse {
  menus?: Menu[];
  [key: string]: unknown;
}

export interface SlugCheckResponse {
  available?: boolean;
  slug?: string;
  suggestions?: string[];
}

export interface UploadResponse {
  url?: string;
  filename?: string;
  [key: string]: unknown;
}

export interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  image?: string;
  isActive: boolean;
  menuId: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ItemCategoryRef {
  id?: number;
  nameAr?: string;
  nameEn?: string;
  [key: string]: unknown;
}

export interface Item {
  id: number;
  /** من الـ API قد يأتي name فقط (بدون تفريق عربي/إنجليزي) */
  name?: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  categoryId: number;
  /** من الـ API قد يكون category نصاً أو كائناً */
  category?: ItemCategoryRef | string;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  image?: string;
  /** API قد يرسل available بدل isAvailable */
  available?: boolean;
  /** هل المنتج متوفر حالياً (في المخزون/للطلب) */
  isAvailable?: boolean;
  sortOrder?: number;
  menuId?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Advertisement {
  id?: number;
  title?: string;
  titleAr?: string;
  content?: string;
  contentAr?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
  menuId?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
