"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  FaPlus,
  FaCheck,
  FaEnvelope,
  FaCalendarTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import PatientSelectionModal from "@/components/Custom/PatientSelectionModal";
import PatientFormModal from "@/components/Custom/PatientFormModal";
import LinkTo from "@/components/Global/LinkTo";
import CardDashBoard from "@/components/Card/CardDashBoard";

interface Patient {
  id: number;
  name: string;
  condition: string;
  image: string;
}

interface LatestUpdate {
  id: number;
  type: "report" | "message" | "cancellation";
  text: string;
  patientName: string;
  date?: string;
}

interface UpcomingAppointment {
  id: number;
  patientName: string;
  time: string;
  date: Date;
  isToday?: boolean;
}

function PatientsPage() {
  const t = useTranslations("");
  const locale = useLocale();
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Fake patient data
  const patients: Patient[] = [
    {
      id: 1,
      name: t("patients.patient1.name") || "Ahmed Mohammed",
      condition: t("patients.patient1.condition") || "Speech Disorders",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    },
    {
      id: 2,
      name: t("patients.patient2.name") || "Fatima Al Ali",
      condition: t("patients.patient2.condition") || "Language Delay",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    },
    {
      id: 3,
      name: t("patients.patient3.name") || "Sarah Jones",
      condition: t("patients.patient3.condition") || "Stuttering",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
    },
    {
      id: 4,
      name: t("patients.patient4.name") || "Mohammed Ali",
      condition: t("patients.patient4.condition") || "Learning Difficulties",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    },
  ];

  const handleSelectChild = (type: "me" | "myChildren") => {
    setIsSelectionModalOpen(false);
    setIsFormModalOpen(true);
    // You can use the type parameter to differentiate between "me" and "myChildren" if needed
    console.log("Selected type:", type);
  };

  // Latest Updates Data
  const latestUpdates: LatestUpdate[] = [
    {
      id: 1,
      type: "report",
      text: t("patients.latestUpdates.reportUploaded"),
      patientName: locale === "ar" ? "فاطمة الزهراء" : "Fatima Al-Zahraa",
    },
    {
      id: 2,
      type: "message",
      text: t("patients.latestUpdates.newMessage"),
      patientName: locale === "ar" ? "يوسف علي" : "Youssef Ali",
    },
    {
      id: 3,
      type: "cancellation",
      text: t("patients.latestUpdates.appointmentCanceled"),
      patientName: locale === "ar" ? "عمر خالد" : "Omar Khaled",
    },
  ];

  // Upcoming Appointments Data
  const upcomingAppointments: UpcomingAppointment[] = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thursday = new Date(today);
    thursday.setDate(thursday.getDate() + 3);

    return [
      {
        id: 1,
        patientName: locale === "ar" ? "يوسف علي" : "Youssef Ali",
        time: `${t("patients.upcomingAppointments.today")} - 10:00 ${t("patients.upcomingAppointments.morning")}`,
        date: today,
        isToday: true,
      },
      {
        id: 2,
        patientName: locale === "ar" ? "فاطمة الزهراء" : "Fatima Al-Zahraa",
        time: `${t("patients.upcomingAppointments.tomorrow")} - 02:30 ${t("patients.upcomingAppointments.evening")}`,
        date: tomorrow,
      },
      {
        id: 3,
        patientName: locale === "ar" ? "عمر خالد" : "Omar Khaled",
        time: `${t("patients.upcomingAppointments.thursday")} - 11:00 ${t("patients.upcomingAppointments.morning")}`,
        date: thursday,
      },
    ];
  }, [locale, t]);

  const getUpdateIcon = (type: LatestUpdate["type"]) => {
    switch (type) {
      case "report":
        return <FaCheck className="w-5 h-5 text-white" />;
      case "message":
        return <FaEnvelope className="w-5 h-5 text-white" />;
      case "cancellation":
        return <FaCalendarTimes className="w-5 h-5 text-white" />;
    }
  };

  const getUpdateIconBg = (type: LatestUpdate["type"]) => {
    switch (type) {
      case "report":
        return "bg-green-500";
      case "message":
        return "bg-yellow-500";
      case "cancellation":
        return "bg-red-500";
    }
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      month: "long",
    });
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">
        {t("patients.title") || "Patients"}
      </h1>
      <CardDashBoard className="flex gap-6">
        {/* Add Patient Card Button */}
        <div className="">
          <button
            onClick={() => setIsSelectionModalOpen(true)}
            className="w-[180px] h-[220px] rounded-xl bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-primary transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FaPlus className="text-primary text-3xl" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">
                {t("patients.addPatient") || "إضافة مريض"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t("patients.addNew") || "إضافة جديد"}
              </p>
            </div>
          </button>
        </div>

        {/* Patients Swiper */}
        <div className="relative w-[calc(100%-200px)]">
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView="auto"
            navigation={{
              prevEl: ".patient-swiper-prev",
              nextEl: ".patient-swiper-next",
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
              1280: {
                slidesPerView: 5,
              },
            }}
          >
            {/* Patient Cards */}
            {patients.map((patient) => (
              <SwiperSlide key={patient.id} className="w-[180px]!">
                <LinkTo
                  href={`/parent/patients/${patient.id}`}
                  className="w-[180px] h-[220px] rounded-xl bg-white border-2 border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center gap-3 p-4"
                >
                  <div className="relative w-20 h-20">
                    <Image
                      src={patient.image}
                      alt={patient.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                      unoptimized
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-lg">
                      {patient.name}
                    </p>
                  </div>
                </LinkTo>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button
            className="patient-swiper-prev absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-white hover:bg-primary border border-gray-200 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="patient-swiper-next absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-white hover:bg-primary border border-gray-200 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardDashBoard>

      {/* Dashboard Section: Latest Updates and Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Updates Section */}
        <CardDashBoard>
          <h2 className="text-xl font-bold mb-4">
            {t("patients.latestUpdates.title")}
          </h2>
          <div className="space-y-4">
            {latestUpdates.map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${getUpdateIconBg(
                    update.type
                  )} flex items-center justify-center shrink-0`}
                >
                  {getUpdateIcon(update.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {update.text}{" "}
                    <span className="font-semibold">
                      &ldquo;{update.patientName}&rdquo;
                    </span>
                    {update.type === "cancellation" && "."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardDashBoard>

        {/* Upcoming Appointments Section */}
        <CardDashBoard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {t("patients.upcomingAppointments.title")}
            </h2>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">
                    {t("patients.upcomingAppointments.sessionWith")} {appointment.patientName}
                  </p>
                  <p className="text-sm text-gray-600">{appointment.time}</p>
                </div>
                <div
                  className={`w-16 h-16 p-4 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                    appointment.isToday
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span className="text-lg font-bold">
                    {getDayNumber(appointment.date)}
                  </span>
                  <span className="text-xs">
                    {getMonthName(appointment.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardDashBoard>
      </div>

      <PatientSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleSelectChild}
      />

      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />
    </div>
  );
}

export default PatientsPage;
