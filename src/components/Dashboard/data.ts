import type { IconType } from "react-icons";
import {
  FaChartLine,
  FaClipboardList,
  FaUserAlt,
  FaUsers,
  FaWifi,
} from "react-icons/fa";

import { BiCategory } from "react-icons/bi";
import { RiWifiOffLine } from "react-icons/ri";
import { FiSettings } from "react-icons/fi";
import { HiSpeakerphone } from "react-icons/hi";
import { MdOutlineFastfood } from "react-icons/md";
export type NavItem = {
  label: string;
  icon: IconType;
  badge?: string;
  active?: boolean;
  key?: string;
  link?: string;
  parentLink?: string;
  dependentParent?: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine ,
        key: "overview",
        link: "",
      },
    ],
  },
  {
    title: "Profile",
    items: [
      {
        label: "Personal",
        icon: FaUserAlt,
        key: "personal",
        link: "personal",
      },
    ],
  },
  {
    title: "Menu Control",
    items: [
      { label: "Categories", icon: BiCategory, key: "categories", link: "categories" },
      {
        label: "Items",
        icon: MdOutlineFastfood ,
        key: "items",
        link: "items",
      },

    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Advertisements", icon: HiSpeakerphone, key: "advertisements", link: "advertisements" },
      { label: "Settings", icon: FiSettings, key: "settings", link: "settings" },
    ],
  },
];

export const parentNavSections: NavSection[] = [
  {
    title: "Profile",
    items: [
      {
        label: "Personal",
        icon: FaUserAlt,
        key: "personalInformation",
        link: "personal/information",
        parentLink: "personal",
        dependentParent: true,
      },
      {
        label: "Patients",
        icon: FaUsers,
        key: "patients",
        link: "patients",
      },
    ],
  },
  {
    title: "Bookings",
    items: [
      { label: "All", icon: BiCategory, key: "allBookings", link: "bookings/all" },
      {
        label: "Online",
        icon: FaWifi,
        key: "onlineBookings",
        link: "bookings/online",
      },
      {
        label: "Offline",
        icon: RiWifiOffLine,
        key: "offlineBookings",
        link: "bookings/offline",
      },
    ],
  },
  {
    title: "Specialists/Centers",
    items: [
      { label: "Reports", icon: FaClipboardList, key: "reports", link: "reports" },
    ],
  },
];
