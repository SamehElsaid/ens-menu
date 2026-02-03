import { PersonalNavigationItem } from "./type";
import { FaUser } from "react-icons/fa";

export const navigationItems: PersonalNavigationItem[] = [
  {
    label: "Information",
    href: "/specialist/personal/information",
    key: "information",
    icon: FaUser,
  },
  {
    label: "Bio",
    href: "/specialist/personal/bio",
    key: "bio",
    icon: FaUser,
  },
  {
    label: "Specialty",
    href: "/specialist/personal/specialty",
    key: "specialty",
    icon: FaUser,
  },
  {
    label: "Available in",
    href: "/specialist/personal/available-in",
    key: "availableIn",
    icon: FaUser,
  },
  {
    label: "Settings",
    href: "/specialist/personal/settings",
    key: "settings",
    icon: FaUser,
  },
];

export const parentNavigationItems: PersonalNavigationItem[] = [
  {
    label: "Information",
    href: "/parent/personal/information",
    key: "information",
    icon: FaUser,
  },
  {
    label: "Settings",
    href: "/parent/personal/settings",
    key: "settings",
    icon: FaUser,
  },
];
