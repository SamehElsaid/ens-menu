/* eslint-disable @next/next/no-img-element */
"use client";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaLanguage,
  FaPaperPlane,
  FaChartLine,
  FaCalendarCheck,
} from "react-icons/fa";
import CardDashBoard from "./Card/CardDashBoard";
import LinkTo from "./Global/LinkTo";

interface ClientSidebarProps {
  clientId: string;
  clientData?: {
    patientName: string;
    parentName: string;
    email?: string;
    phone?: string;
    status?: string;
    role?: string;
    language?: string;
    country?: string;
    totalTasks?: number;
    totalProjects?: number;
    avatar?: string;
  };
}

export default function ClientSidebar({ clientData }: ClientSidebarProps) {
  
  // Sample data - replace with actual API call
  const data = clientData || {
    patientName: "Jane Doe",
    parentName: "John Doe",
    email: "jane.doe@example.com",
    phone: "+1 (234) 567-8901",
    status: "Active",
    role: "Patient",
    language: "English",
    country: "United States",
    totalTasks: 85, // Improve percentage
    totalProjects: 568,
    avatar: undefined,
  };

  const userInitial = data.patientName.charAt(0).toUpperCase();


  return (
    <aside className="w-full lg:w-[350px] shrink-0">
      <CardDashBoard className="sticky top-[90px] shadow-lg h-[calc(100dvh-110px)] overflow-y-auto">
        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-200">
          <div className="relative mb-5">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt={data.patientName}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-primary/20"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-primary/20">
                <span className="text-4xl font-bold text-primary">
                  {userInitial}
                </span>
              </div>
            )}
            <span className="absolute bottom-2 right-2 h-7 w-7 rounded-full border-4 border-white bg-emerald-500 shadow-md flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white"></div>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {data.patientName}
          </h2>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm">
            {data.role || "Patient"}
          </span>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* Improve Percentage Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FaChartLine className="text-primary text-base" />
              <span className="text-xs font-medium text-gray-600">Improve</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalTasks ? `${data.totalTasks}%` : "85%"}
            </p>
          </div>

          {/* Sessions Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarCheck className="text-primary text-base" />
              <span className="text-xs font-medium text-gray-600">
                Sessions
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalProjects || 568}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-5 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            DETAILS
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <FaUser className="text-gray-600 text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1 font-medium">
                  Parent Name
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {data.parentName}
                </p>
              </div>
            </div>
            {data.email && (
              <div className="flex items-start gap-3 p-3 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <FaEnvelope className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-gray-900 break-all">
                    {data.email}
                  </p>
                </div>
              </div>
            )}
            {data.phone && (
              <div className="flex items-start gap-3 p-3 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <FaPhone className="text-green-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Contact
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.phone}
                  </p>
                </div>
              </div>
            )}
            {data.language && (
              <div className="flex items-start gap-3 p-3 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <FaLanguage className="text-purple-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Language
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.language}
                  </p>
                </div>
              </div>
            )}
            {data.country && (
              <div className="flex items-start gap-3 p-3 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <FaGlobe className="text-orange-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Country
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className=" py-3  border-t sticky bottom-[-25px] bg-white border-gray-200">
          <LinkTo 
            href="/chat"
            className="w-full px-4 py-3 rounded-lg bg-linear-to-r from-primary to-primary/90 text-white font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <FaPaperPlane className="text-sm" />
            <span>Send Message</span>
          </LinkTo>
        </div>
      </CardDashBoard>
    </aside>
  );
}
