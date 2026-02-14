import { IconType } from "react-icons";

export interface LinkProps {
  title: string;
  href: string;
  icon: IconType;
}

export interface CountryRaw {
  id: string;
  sortname: string;
  name_en: string;
  name_ar: string;
  phonecode: string;
}

export interface StateRaw {
  id: string;
  name_en: string;
  name_ar: string;
  country_id: string;
}

export interface PaginatedResponse {
  data?: {
    data: unknown[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    isPrevious: boolean;
    isNext: boolean;
  };
}

export interface CityRaw {
  id: string;
  name_en: string;
  name_ar: string;
  state_id: string;
}

export interface MenuItem {
  name: string;
  price: string;
  image: string;
  desc: string;
  category: "drinks" | "bakery" | "food" | "desserts";
}

export interface MenuItemLocalized {
  nameAr: string;
  nameEn: string;
  price: string;
  image: string;
  descAr: string;
  descEn: string;
  category: "drinks" | "bakery" | "food" | "desserts";
}

export interface Template {
  id: number;
  titleAr: string;
  titleEn: string;
  labelAr: string;
  labelEn: string;
  icon: IconType;
  textAr: string;
  textEn: string;
  image: string;
  textAltAr?: string;
  textAltEn?: string;
}


export interface TemplateInfo {
  colors: string[];
  id: string;
  name: string;
  nameAr: string;
  image: string;
  description: string;
  descriptionAr: string;
  isNew: boolean;
  canEdit: boolean;
  slug: string;
  defaultColors?: string[];
}
export interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export interface Feature {
  id: number;
  icon: IconType;
  translationKey: string;
}

export interface NavLink {
  name: string;
  path: string;
  external?: boolean;
}

export interface ContactInfo {
  icon: React.ComponentType<{ className?: string }>;
  type: "phone" | "email" | "address";
  value: string;
  href?: string;
  dir?: "ltr" | "rtl";
}

export interface FAQItemType {
  question: string;
  answer: string;
}

export interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

export interface LogoProps {
  variant?: "default" | "white";
}
