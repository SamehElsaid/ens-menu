import { FiCreditCard, FiHome, FiInfo, FiPhone, FiSmartphone } from "react-icons/fi";
import { LinkProps } from "@/types/types";

export const homeLinks: LinkProps[] = [
  { title: "header.home", href: "/#hero", icon: FiHome },
  // { title: "header.about", href: "about", icon: FiInfo },
  { title: "header.pricingPage", href: "/Pricing", icon: FiCreditCard},
  { title: "header.features", href: "/#features", icon: FiInfo },
  { title: "header.androidApp", href: "/mobile-app", icon: FiSmartphone },
//  { title: "header.faq", href: "/faq", icon: FiInfo },
  { title: "header.contact", href: "/contact", icon: FiPhone },
  // { title: "header.howItWorks", href: "/#how-it-works", icon: FiInfo },
];
