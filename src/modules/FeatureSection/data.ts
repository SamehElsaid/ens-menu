"use client";

import { 
  HiOutlineClock,          
  HiOutlineNoSymbol,       
  HiOutlineBolt,         
  HiOutlineBanknotes,     
  HiOutlineArrowPath,  
  HiOutlineChartBar,     
  HiOutlinePaintBrush,     
  HiOutlineBell,           
  HiOutlineGlobeAlt,       
} from "react-icons/hi2";
import { Feature } from "@/types/types";

export const features: Feature[] = [
  {
    id: 6,
    icon: HiOutlineClock,
    translationKey: "saveTime",
  },
  {
    id: 7,
    icon: HiOutlineNoSymbol, 
    translationKey: "saveCost",
  },
  {
    id: 8,
    icon: HiOutlineBolt, 
    translationKey: "quickMenu",
  },
  {
    id: 0,
    icon: HiOutlineBanknotes, 
    translationKey: "noCommission",
  },
  {
    id: 1,
    icon: HiOutlineArrowPath, 
    translationKey: "instantUpdate",
  },
  {
    id: 2,
    icon: HiOutlineChartBar,
    translationKey: "analytics",
  },
  {
    id: 3,
    icon: HiOutlinePaintBrush, 
    translationKey: "customIdentity",
  },
  {
    id: 4,
    icon: HiOutlineBell,
    translationKey: "staffApp",
  },
  {
    id: 5,
    icon: HiOutlineGlobeAlt, 
    translationKey: "customDomain",
  },
];