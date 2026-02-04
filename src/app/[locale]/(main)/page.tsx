import CTA from "@/components/HomePage/Cta";
import FAQ from "@/components/HomePage/FAQ";
import Features from "@/components/HomePage/FeatureSection";
import FooterSection from "@/components/HomePage/Footer";
import HeroSection from "@/components/HomePage/HeroSection";
import HowItWorks from "@/components/HomePage/HowItWorks";
import TemplateShow from "@/components/HomePage/TemplateShow";

function Page() {
  return (
    <>
      <HeroSection />
      <TemplateShow />
      <Features />
      <HowItWorks />
      <FAQ />
      <CTA />
      <FooterSection />
    </>
  );
}

export default Page;
