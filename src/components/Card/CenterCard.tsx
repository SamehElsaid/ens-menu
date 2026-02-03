/* eslint-disable @next/next/no-img-element */
import { useTranslations } from "next-intl";
import { Center } from "@/modules/center";
import { IoLocationOutline } from "react-icons/io5";

export function CenterCard({ center }: { center: Center }) {
  const t = useTranslations("homePage.centerSection");
  return (
    <div className="group relative overflow-hidden rounded-md bg-black/5 shadow transition duration-300 ">
      <div className="relative h-80 w-full overflow-hidden">
        <img
          src={center.image}
          alt={center.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:grayscale"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/50 via-primary/10 to-transparent transition duration-300 group-hover:from-primary/95 group-hover:via-primary/40" />
        <div className="absolute inset-0 z-10  flex flex-col justify-between p-6 text-white">
          <div className="flex items-center gap-2 text-sm text-white/80"></div>

          <div className="flex items-center gap-2">
            <div className="min-w-[60px] w-[60px] min-h-[60px] rounded-full overflow-hidden ">
              <img
                src={center.logo}
                alt={center.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="">
              <div className="mb-1 inline-flex items-center gap-2">
                <span className="rounded-md  bg-secondary px-3 py-1 text-xs font-semibold text-white ">
                  {center.properties} {t("specialty")}
                </span>
              </div>
              <p className="text-lg font-semibold uppercase tracking-wide line-clamp-1">
                {center.name}
              </p>
              <p className="text-sm  line-clamp-1 flex items-center gap-2 ">
                <IoLocationOutline />{" "}
                <span className="text-sm font-medium line-clamp-1">
                  {center.location}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
