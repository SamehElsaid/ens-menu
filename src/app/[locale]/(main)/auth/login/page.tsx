import Card from "@/components/ui/Card";
import { register } from "@/svg/register";
import LoginForm from "@/components/LoginForm";
export default function LoginIndexPage() {


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
                      Login
                    </h2>
                    <p className="text-sm text-gray-500">
                      Welcome to our system
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <LoginForm />
                </div>

              
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
