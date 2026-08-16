import * as yup from "yup";

export interface AddCategoryFormData {
  nameAr: string;
  nameEn: string;
  isActive: boolean;
}

export function createCategorySchema(messages: {
  nameArRequired: string;
  nameEnRequired: string;
}): yup.ObjectSchema<AddCategoryFormData> {
  return yup.object({
    nameAr: yup.string().required(messages.nameArRequired),
    nameEn: yup.string().required(messages.nameEnRequired),
    isActive: yup.boolean().defined(),
  });
}
