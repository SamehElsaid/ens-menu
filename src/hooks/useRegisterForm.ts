import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { parentRegisterSchema } from "@/schemas/registerSchema";
import { useTranslations } from "use-intl";

export type RegisterType = "parent" | "specialist";

export interface ParentFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: { label: string; value: string };
  state: { label: string; value: string };
  city: { label: string; value: string };
  password: string;
  confirmPassword: string;
}

export interface SpecialistFormDataStep1 {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: { label: string; value: string } | null;
  country: { label: string; value: string };
  state: { label: string; value: string };
  city: { label: string; value: string };
  birthDate: Date;
  password: string;
  confirmPassword: string;
}

export interface SpecialistFormDataStep2 {
  specialization: { label: string; value: string };
  fullName: string;
  nationalID: string;
  attachments: File[];
  ownsCenter: boolean;
}

export interface SpecialistFormDataStep3 {
  centerName: string;
  address: string;
  centerPhone: string;
  centerEmail: string;
  centerImages: File[];
  socialLinks: {
    facebook: string;
    instagram: string;
    whatsapp: string;
    linkedin: string;
    twitter: string;
    youtube: string;
    tiktok: string;
    telegram: string;
    reddit: string;
    pinterest: string;
    github: string;
  };
}

export type SpecialistFormData = SpecialistFormDataStep1 &
  SpecialistFormDataStep2 &
  SpecialistFormDataStep3;

export function useParentRegisterForm(
  t: ReturnType<typeof useTranslations<"">>
) {
  return useForm<ParentFormData>({
    resolver: yupResolver(parentRegisterSchema(t)),
    mode: "onChange",
  });
}
