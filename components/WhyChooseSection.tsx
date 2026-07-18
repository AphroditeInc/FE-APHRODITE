"use client";

type Feature = {
  icon: string;
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  {
    icon: "/why-choose/icon-verified.svg",
    title: "Verified Profiles",
    desc: "All members undergo thorough verification for your safety and peace of mind.",
  },
  {
    icon: "/why-choose/icon-shield.svg",
    title: "Complete Privacy",
    desc: "Your information is encrypted and protected with military-grade security.",
  },
  {
    icon: "/why-choose/icon-clock.svg",
    title: "24/7 Availability",
    desc: "Connect with premium companions whenever you need, day or night.",
  },
];

function FeatureCard({ icon, title, desc }: Feature) {
  return (
    <div className="relative min-h-[254px] overflow-hidden rounded-[20px] border border-[#F6F6F6] bg-white p-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#FEF4F7]">
        <img src={icon} alt="" className="size-8" />
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <h3 className="text-[20px] font-semibold leading-[40px] text-[#121212] sm:text-[24px]">
          {title}
        </h3>
        <p className="text-[14px] font-normal leading-[35px] text-[#807E7E] sm:text-[18px] sm:leading-[35px]">
          {desc}
        </p>
      </div>
    </div>
  );
}

function ImageCard() {
  return (
    <div className="relative min-h-[254px] overflow-hidden rounded-[20px] border border-[#F6F6F6] bg-[#E4E4E4]">
      <img
        src="/why-choose/couple.webp"
        alt="Premium companionship service"
        className="absolute inset-0 size-full object-cover"
      />
      {/* Dark gradient rising from the bottom — matches the layered gradient in the design */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.8) 44.66%, rgba(0,0,0,0) 100%)",
        }}
      />
      <p className="absolute bottom-[25px] left-6 w-[378px] max-w-[calc(100%-48px)] text-[14px] font-normal leading-[32px] text-white sm:text-[18px] sm:leading-[35px]">
        Our platform is designed for busy professionals who value quality,
        discretion, and convenience above all else.
      </p>
    </div>
  );
}

export default function WhyChooseSection() {
  return (
    <section id="why-choose-us" className="w-full bg-white">
      {/* max-w 1248 = 1200px content + 24px padding each side, so at desktop the
          card grid is exactly 1200px (two 588px cards + 24px gap) as in Figma */}
      <div className="mx-auto max-w-[1248px] px-6 pb-16 pt-16">
        {/* Header */}
        <div className="mx-auto flex w-full max-w-[588px] flex-col items-center gap-4 text-center">
          <h2 className="text-[24px] font-bold leading-[40px] sm:text-[40px] sm:leading-[48px]">
            <span className="text-[#121212]">Why Choose </span>
            <span className="text-[#FA266D]">Aphrodite</span>
          </h2>
          <p className="text-[14px] font-normal leading-[30px] text-[#807E7E] opacity-80 sm:text-[18px] sm:leading-[35px]">
            Experience unparalleled service with our premium platform designed{" "}
            <span className="lg:block">for discerning individuals</span>
          </p>
        </div>

        {/* Cards - 2x2 grid: Verified | Image, Privacy | 24/7 */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FeatureCard {...FEATURES[0]} />
          <ImageCard />
          <FeatureCard {...FEATURES[1]} />
          <FeatureCard {...FEATURES[2]} />
        </div>
      </div>
    </section>
  );
}
