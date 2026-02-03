import { IconType } from "react-icons";

export interface PersonalNavigationItem {
  label: string;
  href: string;
  key: string;
  icon: IconType;
}

export type DashboardFormData = {
  profileImage: File | null;
  firstName: string;
  lastName: string;
  displayNameEn: string;
  displayNameAr: string;
  phone: string;
  email: string;
  country: { label: string; value: string } | null;
  state: { label: string; value: string } | null;
  city: { label: string; value: string } | null;
  gender: { label: string; value: string } | null;
  attachments?: File[] | null;
};
