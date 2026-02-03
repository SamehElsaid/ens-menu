import CustomLogo from "@/components/Custom/CustomLogo";
import LoginForm from "@/components/LoginForm";
import Card from "@/components/ui/Card";
import { useTranslations } from "next-intl";
export default function RegisterIndexPage() {
  const t = useTranslations("");


  return (
    <div className=" bg-gradient-app overflow-hidden py-12 px-4 sm:px-6 lg:px-8 relative  flex items-center justify-center">
      <div className="container flex items-center justify-center ">
        <div className="rounded-md!   mt-10 min-h-[calc(100dvh-140px)] w-full flex items-center justify-center">
          <div className="flex gap-10  w-full flex-col lg:flex-row ">


            {/* Left: selection card area */}
            <div className="fixed inset-0 overflow-hidden bg-white pointer-events-none">
              <div className="particle particle-drift-slow w-64 h-64 bg-accent-purple rounded-full top-[-5%] right-[-10%]" style={{ opacity: '0.08' }} />
              <div className="particle particle-drift-medium w-48 h-48 bg-deep-indigo rounded-full top-[60%] left-[-5%]" style={{ opacity: '0.05' }} />
              <div className="particle particle-drift-slow w-32 h-32 bg-accent-purple rounded-full top-[25%] left-[15%]" style={{ opacity: '0.06' }} />
              <div className="particle particle-drift-medium w-72 h-72 bg-royal-purple rounded-[3rem] bottom-[-10%] right-[5%] -rotate-12" style={{ opacity: '0.07' }} />
              <div className="particle particle-drift-slow w-40 h-40 bg-accent-purple rounded-4xl top-[40%] right-[20%]" style={{ opacity: '0.04' }} />
              <div className="particle particle-drift-medium w-24 h-24 bg-deep-indigo rounded-3xl top-[10%] left-[30%]" style={{ opacity: '0.09' }} />
            </div>
            <div className=" max-w-[500px]  mx-auto relative">
              <Card className="max-w-none! bg-transparent! md:bg-white!  shadow-none! md:shadow-md! ">
                <div className="relative z-10 flex flex-col h-full  w-full px-6 py-8">
                  <CustomLogo />
                  <div className="flex-1 flex flex-col max-w-[400px] mx-auto w-full">
                    <div className="mb-10 text-center">
                      <h2 className="text-2xl  text-royal-purple mb-2">{t("auth.welcomeBack")}</h2>
                      <p className="text-slate-500 ">{t("auth.welcomeBackDescription")}</p>
                    </div>
                    <LoginForm />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

