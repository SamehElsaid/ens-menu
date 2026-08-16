export interface DeliveryBranch {
  id: number;
  nameAr?: string | null;
  nameEn?: string | null;
  name?: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  deliveryBasePrice?: number | string | null;
  deliveryPricePerKm?: number | string | null;
  maxDeliveryRadiusKm?: number | string | null;
}
