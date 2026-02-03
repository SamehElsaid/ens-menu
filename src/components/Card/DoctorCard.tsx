/* eslint-disable @next/next/no-img-element */
import { Doctor } from "@/modules/doctor";
import RatingBadge from "../RatingBadge";

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="group relative h-full rounded-md ">
      <div className="relative flex h-full flex-col gap-5 rounded-md border border-white/70 bg-white/90 p-6 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm transition duration-300  hover:bg-secondary/5">
        <div className="flex items-center justify-between">
          <span
            className={` items-center gap-2  max-w-[80%] line-clamp-1 rounded-md px-4 py-1 text-xs font-semibold  ${
              doctor.id % 2 === 0
                ? "bg-primary/10 text-primary"
                : "bg-secondary/10 text-secondary"
            }`}
          >
            {doctor.specialty}{" "}
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                doctor.id % 2 === 0 ? "bg-primary" : "bg-secondary"
              }`}
            />
          </span>
          <RatingBadge rating={doctor.rating} />
        </div>

        <div className="flex items-center flex-col gap-2">
          <div className="relative">
            <span className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/30 to-primary/5 blur" />
            <div className="relative flex h-full min-w-full items-center justify-center rounded-md bg-white p-0.5 shadow-inner">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="h-[150px] w-full  rounded-md object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="space-y-1 ">
            <p className="text-lg font-semibold text-slate-900 text-center">
              {doctor.name}
            </p>

            <p className="flex items-center justify-center  text-center gap-2 text-sm text-slate-500 ">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="h-4 min-w-4 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11z"
                />
                <circle cx="12" cy="10" r="2.2" />
              </svg>
              <span className="line-clamp-1 ">{doctor.location}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DoctorCard;
