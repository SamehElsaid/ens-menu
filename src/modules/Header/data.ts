import { FiHome, FiInfo, FiMessageCircle } from "react-icons/fi";
import { LinkProps } from "@/types/types";

export const homeLinks: LinkProps[] = [
  { title: "header.home", href: "/#hero", icon: FiHome },
  // { title: "header.about", href: "about", icon: FiInfo },
  { title: "header.pricing", href: "/#pricing", icon: FiInfo },
  { title: "header.features", href: "/#features", icon: FiInfo },
  // { title: "header.howItWorks", href: "/#how-it-works", icon: FiInfo },
  // { title: "header.faq", href: "/faq", icon: FiInfo },
  { title: "header.contact", href: "/#contact", icon: FiMessageCircle },
];
