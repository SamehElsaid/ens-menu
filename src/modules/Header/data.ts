import { FiHome, FiInfo, FiMessageCircle } from "react-icons/fi";
import { LinkProps } from "@/types/types";

export const homeLinks: LinkProps[] = [
  { title: "header.home", href: "/", icon: FiHome },
  { title: "header.about", href: "/about", icon: FiInfo },
  { title: "header.contact", href: "/contact", icon: FiMessageCircle },
];
