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
import {
  ENSMENU_SUPPORT_EMAIL,
  ENSMENU_WHATSAPP_DISPLAY,
  ENSMENU_WHATSAPP_URL,
} from "@/lib/contactConstants";

type TranslationFunction = (key: string) => string;

export const ENSMENU_MAP_COORDS = {
  lat: 30.790922,
  lng: 30.979344,
} as const;

export const ENSMENU_MAP_EMBED_URL = `https://maps.google.com/maps?q=${ENSMENU_MAP_COORDS.lat},${ENSMENU_MAP_COORDS.lng}&z=17&hl=en&output=embed`;

export const ENSMENU_MAP_EXTERNAL_URL =
  "https://www.google.com/maps/@30.790922,30.979344,119m/data=!3m1!1e3?hl=en&entry=ttu";

export const getContactInfo = (t: TranslationFunction): ContactInfo[] => [
  {
    icon: FiPhone,
    type: "phone",
    labelKey: "phoneUae",
    value: "+971586551491",
    href: "tel:+971586551491",
    whatsappHref: "https://wa.me/971586551491",
    dir: "ltr",
  },
  {
    icon: FiSmartphone,
    type: "phone",
    subLabelKey: "sales",
    value: "+201500800050",
    href: "tel:+201500800050",
    whatsappHref: "https://wa.me/201500800050",
    dir: "ltr",
  },
  {
    icon: FaWhatsapp,
    type: "linaWhatsapp",
    subLabelKey: "linaWhatsapp",
    value: "",
  },
  {
    icon: FiPhone,
    type: "phone",
    subLabelKey: "techSupport",
    value: "+201553841793",
    href: "tel:+201553841793",
    whatsappHref: "https://wa.me/201553841793",
    dir: "ltr",
  },
  {
    icon: FiMail,
    type: "email",
    labelKey: "email",
    value: ENSMENU_SUPPORT_EMAIL,
    href: `mailto:${ENSMENU_SUPPORT_EMAIL}`,
  },
  {
    icon: FaWhatsapp,
    type: "whatsapp",
    labelKey: "whatsapp",
    value: ENSMENU_WHATSAPP_DISPLAY,
    href: ENSMENU_WHATSAPP_URL,
    dir: "ltr",
  },
  {
    icon: FiMapPin,
    type: "location",
    labelKey: "location",
    value: t("location"),
    mapEmbedUrl: ENSMENU_MAP_EMBED_URL,
    externalMapUrl: ENSMENU_MAP_EXTERNAL_URL,
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
  { name: headerT("about"), path: "/about" },
  { name: headerT("features"), path: "/#features" },
  { name: headerT("team"), path: "/#how-it-works" },
  { name: headerT("knowledgeBase"), path: "/knowledge-base" },
  {
    name: headerT("contact"),
    path: "/contact",
  },
];

export const getFooterNavLinks = (t: TranslationFunction): NavLink[] => [
  { name: t("linkPricing"), path: "/Pricing" },
  { name: t("linkKnowledge"), path: "/knowledge-base" },
  { name: t("linkContact"), path: "/contact" },
];
