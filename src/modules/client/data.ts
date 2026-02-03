import { ClientNavigationItem } from "./type";
import { FaHome, FaCalendarAlt, FaClipboardList, FaStar } from "react-icons/fa";

export const clientNavigationItems: ClientNavigationItem[] = [
  {
    label: "Overview",
    href: "/specialist/clients",
    key: "overview",
    icon: FaHome,
  },
  {
    label: "Sessions",
    href: "/specialist/clients",
    key: "sessions",
    icon: FaCalendarAlt,
  },
  {
    label: "Treatment Plan",
    href: "/specialist/clients",
    key: "treatment-plan",
    icon: FaClipboardList,
  },
  {
    label: "Rates",
    href: "/specialist/clients",
    key: "rates",
    icon: FaStar,
  },
];

