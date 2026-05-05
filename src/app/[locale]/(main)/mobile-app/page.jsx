import HeroSection from "@/components/mobile-app/HeroApp";
import TemplateDescription from "@/components/mobile-app/TemplateDescription";
import FaqSection from "@/components/mobile-app/FaqApp";
import FeaturesApp from "@/components/mobile-app/FeaturesApp";
import WorkflowApp from "@/components/mobile-app/WorkflowApp";
import FooterSection from "@/components/HomePage/Footer";
import PricingSection from "@/components/HomePage/PricingSection";

export default function MobileAppPage() {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0d1117]">
        <HeroSection />
        <WorkflowApp /> 

        <FeaturesApp /> 
        <FaqSection /> 
  
        <TemplateDescription />
  
       <PricingSection />

        <footer className="py-20 text-center bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-2xl font-bold mb-6">جاهز لتبسيط عملك؟</h2>
            <a href="https://expo.dev/artifacts/eas/iXgE6EHRgCGLqf8HwRek6R.apk" className="px-12 py-4 bg-purple-600 text-white rounded-full font-bold shadow-xl hover:bg-purple-700 transition-all">
               حمل التطبيق الآن مجاناً
            </a>
        </footer>
        <FooterSection />
      </main>
  
      );
  }