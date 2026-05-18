import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiSmartphone,
} from "react-icons/fi";

import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

import { ContactInfo, NavLink } from "@/types/types";

type TranslationFunction = (key: string) => string;

export const getContactInfo = (t: TranslationFunction): ContactInfo[] => [
  {
    icon: FiPhone,
    type: "phone",
    labelKey: "phoneUae",
    value: "+971586551491",
    href: "tel:+971586551491",
    dir: "ltr",
  },
  {
    icon: FiSmartphone,
    type: "phone",
    labelKey: "phoneEgypt",
    value: "01500800050",
    href: "tel:+201500800050",
    dir: "ltr",
  },
  {
    icon: FiMail,
    type: "email",
    labelKey: "email",
    value: "info@ensmenu.com",
    href: "mailto:info@ensmenu.com",
  },
  {
    icon: FiMapPin,
    type: "address",
    labelKey: "address",
    value: t("UnitedArabEmirates"),
  },
];

// 👇 Social Media Links
export const getSocialLinks = () => [
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/ens.menu",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    href: "https://www.facebook.com/Ensmenu/",
  },
  {
    name: "TikTok",
    icon: FaTiktok,
    href: "https://www.tiktok.com/@ensmenu6?_r=1&_t=ZS-96PDguGCcBk",
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    href: "https://wa.me/201500800050",
  },
  {
    name: "Youtube",
    icon: FaYoutube,
    href: "https://www.youtube.com/@EnsMENU",
  },
];

export const getNavLinks = (headerT: TranslationFunction): NavLink[] => [
  { name: headerT("home"), path: "/#hero" },
  { name: headerT("features"), path: "/#features" },
  { name: headerT("team"), path: "/#how-it-works" },
  { name: headerT("faq"), path: "/faq" },
  {
    name: headerT("contact"),
    path: "/contact",
  },
];