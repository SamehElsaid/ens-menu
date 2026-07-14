export type MenuRating = {
  id: number;
  stars: number;
  comment?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  createdAt: string;
};

export type MenuRatingsSummary = {
  total: number;
  average: number;
};

export type MenuRatingsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MenuRatingsResponse = {
  success?: boolean;
  data?: {
    ratings?: MenuRating[];
    summary?: MenuRatingsSummary;
    pagination?: MenuRatingsPagination;
  };
};
