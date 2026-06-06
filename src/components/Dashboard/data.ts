import type { IconType } from "react-icons";
import { FaChartLine, FaCreditCard, FaUserAlt } from "react-icons/fa";

import { BiCategory } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { HiSpeakerphone } from "react-icons/hi";
import {
  MdOutlineFastfood,
  MdOutlineTableBar,
  MdPeopleOutline,
} from "react-icons/md";
import {
  IoDocumentTextOutline,
  IoLibraryOutline,
  IoPhonePortraitOutline,
  IoPricetagOutline,
  IoSettingsOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoCallOutline,
  IoSparklesOutline,
} from "react-icons/io5";
export type NavItem = {
  label: string;
  icon: IconType;
  badge?: string;
  badges?: Array<{ label: string; variant: "new" | "beta" }>;
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

/** Cashier staff: operational pages + activity log — no settings, staff management, profile, or ads. */
export const cashierNavSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
      },
    ],
  },
  {
    title: "Menu Import",
    items: [
      {
        label: "menuImport",
        icon: IoSparklesOutline,
        key: "import",
        link: "import",
        badges: [
          { label: "badgeNew", variant: "new" },
          { label: "badgeBeta", variant: "beta" },
        ],
      },
    ],
  },
  {
    title: "Menu Control",
    items: [
      {
        label: "Categories",
        icon: BiCategory,
        key: "categories",
        link: "categories",
      },
      {
        label: "Items",
        icon: MdOutlineFastfood,
        key: "items",
        link: "items",
      },
      {
        label: "tables",
        icon: MdOutlineTableBar,
        key: "tables",
        link: "table",
      },
      {
        label: "history",
        icon: IoTimeOutline,
        key: "history",
        link: "history",
      },
    ],
  },
];

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
      },
      {
        label: "analytics",
        icon: IoStatsChartOutline,
        key: "analytics",
        link: "analytics",
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
      {
        label: "Subscription",
        icon: FaCreditCard,
        key: "subscription",
        link: "subscription",
      },
    ],
  },
  {
    title: "Menu Import",
    items: [
      {
        label: "menuImport",
        icon: IoSparklesOutline,
        key: "import",
        link: "import",
        badges: [
          { label: "badgeNew", variant: "new" },
          { label: "badgeBeta", variant: "beta" },
        ],
      },
    ],
  },
  {
    title: "Menu Control",
    items: [
      {
        label: "Categories",
        icon: BiCategory,
        key: "categories",
        link: "categories",
      },
      {
        label: "Items",
        icon: MdOutlineFastfood,
        key: "items",
        link: "items",
      },
      {
        label: "tables",
        icon: MdOutlineTableBar,
        key: "tables",
        link: "table",
      },
      {
        label: "staff",
        icon: MdPeopleOutline,
        key: "staff",
        link: "staff",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        label: "Advertisements",
        icon: HiSpeakerphone,
        key: "advertisements",
        link: "advertisements",
      },
      {
        label: "Settings",
        icon: FiSettings,
        key: "settings",
        link: "settings",
      },
      {
        label: "history",
        icon: IoTimeOutline,
        key: "history",
        link: "history",
      },
    ],
  },
];

export const adminNavSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Overview",
        icon: FaChartLine,
        key: "overview",
        link: "",
      },
      {
        label: "analytics",
        icon: IoStatsChartOutline,
        key: "analytics",
        link: "analytics",
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
      {
        label: "followUps",
        icon: IoCallOutline,
        key: "follow-ups",
        link: "follow-ups",
      },
      {
        label: "plans",
        icon: IoDocumentTextOutline,
        key: "plans",
        link: "plans",
      },
      {
        label: "payments",
        icon: FaCreditCard,
        key: "payments",
        link: "payments",
      },
      {
        label: "advertisements",
        icon: HiSpeakerphone,
        key: "advertisements",
        link: "advertisements",
      },
      {
        label: "administrators",
        icon: IoSettingsOutline,
        key: "administrators",
        link: "administrators",
      },
      {
        label: "appVersion",
        icon: IoPhonePortraitOutline,
        key: "app-version",
        link: "app-version",
      },
      {
        label: "promo",
        icon: IoPricetagOutline,
        key: "promo",
        link: "promo",
      },
      {
        label: "knowledgeManagement",
        icon: IoLibraryOutline,
        key: "knowledge-management",
        link: "knowledge-management",
      },
    ],
  },
];
