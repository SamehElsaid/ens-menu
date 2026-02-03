import Link from "next/link";
import Card from "@/components/ui/Card";
import { FaBuilding, FaUser, FaUserMd } from "react-icons/fa";
import { register } from "@/svg/register";
export default function RegisterIndexPage() {
  const tiles = [
    {
      href: "/auth/register/parent",
      icon: <FaUser className="text-3xl text-white" />,
      title: "Register as Parent",
      description: "Create an account to get started",
      isPrimary: true,
    },
    {
      href: "/auth/register/specialist",
      icon: <FaUserMd className="text-3xl text-primary" />,
      title: "Register as Specialist",
      description: "Join our network of specialists",
      isPrimary: false,
    },
    {
      href: "/auth/register/center",
      icon: <FaBuilding className="text-3xl text-primary" />,
      title: "Register as Center",
      description: "Join our network of centers",
      isPrimary: false,
    },
  ];

  
  return (
    <div className=" bg-gradient-app overflow-hidden py-12 px-4 sm:px-6 lg:px-8 relative  flex items-center justify-center">
      <div className="container flex items-center justify-center ">
        <div className="rounded-md!   mt-10 min-h-[calc(100dvh-140px)] w-full flex items-center justify-center">
          <div className="flex gap-10  w-full flex-col lg:flex-row ">
          
            {/* Right: welcome + decorative illustration */}
            <div className="relative w-full">
              <div className="h-full w-full relative rounded-md!">
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-full max-w-[70%] lg:max-w-none  mx-auto ">
                    <span dangerouslySetInnerHTML={{ __html: register }}></span>
                  </div>
                </div>

                {/* glow accents */}
                <span className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-primary/40 blur-3xl" />
                <span className="absolute -bottom-6 -right-10 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
              </div>
            </div>
              {/* Left: selection card area */}
              <div className="w-full">
              <Card className="max-w-none!">
                <div className="flex items-center gap-6 border-b border-gray-100 pb-6 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">U</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Sign Up
                    </h2>
                    <p className="text-sm text-gray-500">
                      Choose your account type
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {tiles.map((t) => (
                    <Link key={t.href} href={t.href} className="group block">
                      <div className="rounded-md   transition-all duration-300 hover:shadow-sm overflow-hidden">
                        <div
                          className={`p-1 ${
                            t.isPrimary ? "card-gradient" : ""
                          } rounded-2xl`}
                        >
                          <div className="bg-white rounded-md px-5 py-5 flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-md flex items-center justify-center ${
                                t.isPrimary
                                  ? "bg-linear-to-r from-primary to-secondary"
                                  : "bg-primary/10"
                              }`}
                            >
                              {t.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                {t.title}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {t.description}
                              </p>
                            </div>
                            <div
                              className={`text-sm font-medium px-4 py-2 rounded-md! transition-all ${
                                t.isPrimary
                                  ? "btn-gradient-primary shadow-sm"
                                  : "bg-white border border-gray-200 text-gray-700 group-hover:bg-gray-50"
                              }`}
                            >
                              Continue
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 text-[11px] text-gray-500">
                  By continuing you agree to our Terms of Service and Privacy
                  Policy.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

