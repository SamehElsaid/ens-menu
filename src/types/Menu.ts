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
