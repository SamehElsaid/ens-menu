import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import ParentRegisterForm from "@/components/forms/ParentRegisterForm";
import { FaBuilding, FaUser, FaUserMd } from "react-icons/fa";
import { parent } from "@/svg/parent";
import { doctor } from "@/svg/doctor";
import SpecialistRegisterForm from "@/components/forms/SpecialistRegisterForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ type: "parent" | "specialist" | "center"; locale: string }>;
}) {
  const { type } = await params;

  return <ParentRegisterFormComponent type={type} />;
}

const ParentRegisterFormComponent = ({
  type,
}: {
  type: "parent" | "specialist" | "center";
}) => {
  const t = useTranslations("");

  return (
    <div className=" bg-gradient-app py-12 overflow-hidden px-4 sm:px-6 lg:px-8 relative  flex items-center justify-center">
      {/* Decorative blobs */}

      <div className="container flex items-center justify-center ">
        <div className="mt-16 rounded-md!  min-h-[calc(100dvh-140px)] w-full flex items-center justify-center">
          <div className={`flex w-full gap-10 flex-col lg:flex-row! `}>
            {" "}
            {/* Right: Welcome / illustration */}
            <div className=" w-full ">
              <div className="h-full w-full relative rounded-md!">
                <div className="relative  z-10 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-full max-w-[70%] lg:max-w-none  mx-auto ">
                    <span
                      className="w-full"
                      dangerouslySetInnerHTML={{
                        __html: type === "parent" ? parent : doctor,
                      }}
                    ></span>
                  </div>

                  {/* glow accents */}
                  <span className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-primary/40 blur-3xl" />
                  <span className="absolute -bottom-6 -right-10 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
                </div>
              </div>
            </div>
            {/* Left: Header + Form in card */}
            <div className="w-full">
              <Card className="max-w-none!">
                {/* Header with icon and title */}

                <div className="flex items-center gap-6 border-b border-gray-100 pb-6 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {type === "parent" ? (
                      <FaUser className="text-2xl text-primary" />
                    ) : type === "specialist" ? (
                      <FaUserMd className="text-2xl text-primary" />
                    ) : (
                      <FaBuilding className="text-2xl text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {type === "parent"
                        ? t("auth.parentTitle")
                        : type === "specialist"
                        ? t("auth.specialistTitle")
                        : t("auth.centerTitle")}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {type === "parent"
                        ? t("auth.parentDescription")
                        : type === "specialist"
                        ? t("auth.specialistDescription")
                        : t("auth.centerDescription")}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="mt-2">
                  {type === "parent" ? (
                    <ParentRegisterForm />
                  ) : type === "specialist" ? (
                    <SpecialistRegisterForm type="specialist" />
                  ) : (
                    <SpecialistRegisterForm type="center" />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
