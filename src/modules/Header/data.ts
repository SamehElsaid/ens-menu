import {
  FiBookOpen,
  FiCreditCard,
  FiHome,
  FiInfo,
  FiPhone,
  FiSmartphone,
  FiDownload,
} from "react-icons/fi";
import { LinkProps } from "@/types/types";

export const homeLinks: LinkProps[] = [
  { title: "header.home", href: "/#hero", icon: FiHome },
  { title: "header.about", href: "/about", icon: FiInfo },
  { title: "header.pricingPage", href: "/pricing", icon: FiCreditCard },
  {
    title: "header.mobileApps",
    icon: FiSmartphone,
    children: [
      { title: "header.androidApp", href: "/mobile-app", icon: FiSmartphone },
      { title: "header.ownerApp", href: "/ens_owner_app_owner", icon: FiDownload },
    ],
  },
  { title: "header.knowledgeBase", href: "/knowledge-base", icon: FiBookOpen },
  { title: "header.contact", href: "/contact", icon: FiPhone },
];
