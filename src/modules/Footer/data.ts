import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { ContactInfo, NavLink } from "@/types/types";

type TranslationFunction = (key: string) => string;

export const getContactInfo = (t: TranslationFunction): ContactInfo[] => [
  {
    icon: FiPhone,
    type: "phone",
    value: "+971586551491",
    href: "tel:+971586551491",
    dir: "ltr",
  },
  {
    icon: FiMail,
    type: "email",
    value: "info@ensmenu.com",
    href: "mailto:info@ensmenu.com",
  },
  {
    icon: FiMapPin,
    type: "address",
    value: t("UnitedArabEmirates"),
  },
];

export const getNavLinks = (headerT: TranslationFunction): NavLink[] => [
  { name: headerT("home"), path: "#hero" },
  { name: headerT("features"), path: "#features" },
  { name: headerT("team"), path: "#how-it-works" },
  { name: headerT("faq"), path: "#faq" },
  {
    name: headerT("contact"),
    path: "https://wa.me/971586551491",
    external: true,
  },
];
