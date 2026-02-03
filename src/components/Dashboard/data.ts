import type { IconType } from "react-icons";
import {
  FaAward,
  FaBriefcase,
  FaCalendar,
  FaEnvelope,
  FaStar,
  FaUserAlt,
  FaUsers,
  FaWifi,
} from "react-icons/fa";

import { BiCategory } from "react-icons/bi";
import { RiWifiOffLine } from "react-icons/ri";
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
        label: "Work Schedule",
        icon: FaCalendar,
        key: "workSchedule",
        link: "work-schedule",
      },
      {
        label: "Qualifications",
        icon: FaAward,
        key: "qualifications",
        link: "qualifications",
      },
      {
        label: "Worked At",
        icon: FaBriefcase,
        key: "workedAt",
        link: "worked-at",
      },
      {
        label: "Application",
        icon: FaEnvelope,
        key: "application",
        link: "application",
      },
    ],
  },
  {
    title: "Bookings",
    items: [
      { label: "All", icon: BiCategory, key: "all" },
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
    title: "ًWork",
    items: [
      { label: "Clients", icon: FaUsers, key: "clients", link: "clients" },
    ],
  },
];
