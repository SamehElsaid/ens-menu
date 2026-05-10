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
    value: "+971586551491",
    href: "tel:+971586551491",
    dir: "ltr",
  },
  {
    icon: FiSmartphone,
    type: "phone",
    value: "01500800050",
    href: "tel:+201500800050",
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

// 👇 Social Media Links
export const getSocialLinks = () => [
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "https://instagram.com/yourpage",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    href: "https://facebook.com/yourpage",
  },
  {
    name: "TikTok",
    icon: FaTiktok,
    href: "https://tiktok.com/@yourpage",
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    href: "https://wa.me/971586551491",
  },
  {
    name: "Youtube",
    icon: FaYoutube,
    href: "https://youtube.com/@yourpage",
  },
];

export const getNavLinks = (headerT: TranslationFunction): NavLink[] => [
  { name: headerT("home"), path: "/#hero" },
  { name: headerT("features"), path: "/#features" },
  { name: headerT("team"), path: "/#how-it-works" },
  { name: headerT("faq"), path: "/faq" },
  {
    name: headerT("contact"),
    path: "https://wa.me/971586551491",
    external: true,
  },
];