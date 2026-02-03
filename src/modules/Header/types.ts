export interface LinkProps {
  title: string;
  href: string;
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