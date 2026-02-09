import { FiSettings } from "react-icons/fi";
import { IoMdColorFill } from "react-icons/io";
import { RiGlobalFill } from "react-icons/ri";

export type SettingNavigationItem = {
    label: string;
    href: string;
    icon: React.ElementType;
};

export const navigationItems: SettingNavigationItem[] = [
    {
        label: "setting",
        href: "/",
        icon: FiSettings,
    },
    {
        label: "design",
        href: "/design",
        icon: IoMdColorFill ,
    },
    {
        label: "media",
        href: "/media",
        icon: RiGlobalFill ,
    },
];