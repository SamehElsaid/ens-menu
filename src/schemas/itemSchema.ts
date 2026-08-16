import * as yup from "yup";

export interface AddItemFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryId: string;
  price: string;
  discountPercent: string;
  isAvailable: boolean;
}

interface ItemSchemaMessages {
  nameArRequired: string;
  nameEnRequired: string;
  categoryRequired: string;
  priceRequired: string;
  discountMinError: string;
  discountMaxError: string;
}

export function createItemSchema(
  messages: ItemSchemaMessages,
  priceMode: "single" | "multiple",
): yup.ObjectSchema<AddItemFormData> {
  return yup.object({
    nameAr: yup.string().required(messages.nameArRequired),
    nameEn: yup.string().required(messages.nameEnRequired),
    descriptionAr: yup.string().defined(),
    descriptionEn: yup.string().defined(),
    categoryId: yup.string().required(messages.categoryRequired),
    price: yup
      .string()
      .defined()
      .test("single-price", messages.priceRequired, (value) =>
        priceMode === "multiple" ? true : Boolean(value?.trim()),
      ),
    discountPercent: yup
      .string()
      .defined()
      .test(
        "discount-min",
        messages.discountMinError,
        (value) => !value || Number(value) >= 0,
      )
      .test(
        "discount-max",
        messages.discountMaxError,
        (value) => !value || Number(value) <= 100,
      ),
    isAvailable: yup.boolean().defined(),
  });
}
