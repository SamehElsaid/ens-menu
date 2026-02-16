import type { IconType } from "react-icons";
import {
  FaChartLine,
  FaUserAlt,
} from "react-icons/fa";

import { BiCategory } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { HiSpeakerphone } from "react-icons/hi";
import { MdOutlineFastfood } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
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


export const adminNavSections: NavSection[] = [
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
    title: "control Panel",
    items: [
      { label: "users", icon: FaUserAlt, key: "users", link: "users" },
      { label: "advertisements", icon: HiSpeakerphone, key: "advertisements", link: "advertisements" },
      { label: "administrators", icon: IoSettingsOutline , key: "administrators", link: "administrators" },
    ],
  },
];
