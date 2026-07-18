import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import WhyChooseSection from "../components/WhyChooseSection";
import ExploreSection from "../components/ExploreSection";
import HowItWorksSection from "../components/HowItWorksSection";
import ReadyToExperienceSection from "../components/ReadyToExperienceSection";
import DriveSection from "../components/DriveSection";
import SafetySection from "../components/SafetySection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <WhyChooseSection />
      <ExploreSection />
      <HowItWorksSection />
      <ReadyToExperienceSection />
      <DriveSection />
      <SafetySection />
      <Footer />
    </>
  );
}
