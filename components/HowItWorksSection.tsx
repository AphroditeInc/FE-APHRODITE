"use client";

type Step = {
  icon: string;
  title: string;
  description: string;
};

// Logical order (desktop, left→right). Mobile renders these in reverse.
const STEPS: Step[] = [
  {
    icon: "/how-it-works/icon-profile-add.svg",
    title: "Create Profile",
    description:
      "Sign up and complete our secure verification process to join our exclusive community.",
  },
  {
    icon: "/how-it-works/icon-search-status.svg",
    title: "Browse & Discover",
    description:
      "Explore our curated selection of premium companions and services tailored to your preferences.",
  },
  {
    icon: "/how-it-works/icon-calendar-tick.svg",
    title: "Book Your Experience",
    description:
      "Schedule your appointment with ease using our intuitive booking system.",
  },
  {
    icon: "/how-it-works/icon-star.svg",
    title: "Enjoy Premium Service",
    description:
      "Experience world-class companionship with complete discretion and professionalism.",
  },
];

const DASH_V =
  "repeating-linear-gradient(to bottom, #FA266D 0 6px, transparent 6px 12px)";
const DASH_H =
  "repeating-linear-gradient(to right, #FA266D 0 6px, transparent 6px 12px)";

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-white hidden lg:block">
      <div className="mx-auto max-w-[1248px] px-6 pb-16 pt-10 lg:pt-16">
        {/* Title and Subtitle */}
        <div className="mx-auto flex max-w-[588px] flex-col items-center gap-2 text-center lg:gap-4">
          <h2 className="text-[24px] font-bold leading-[40px] lg:text-[40px] lg:leading-[48px]">
            <span className="text-[#121212]">How </span>
            <span className="text-[#FA266D]">Aphrodite </span>
            <span className="text-[#121212]">Works</span>
          </h2>
          <p className="text-[14px] font-normal leading-[24px] text-[#807E7E] opacity-80 lg:text-[18px] lg:leading-[35px]">
            Getting started is simple. Join thousands of satisfied members in
            just four easy steps.
          </p>
        </div>

        {/* Steps — Desktop: horizontal row with a dashed line behind the icons */}
        <div className="relative mt-10 hidden lg:block">
          <div
            className="absolute left-1/2 top-8 h-px w-[915.5px] -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundImage: DASH_H }}
          />
          <div className="relative z-10 grid grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="flex w-[282px] flex-col items-center gap-6 text-center"
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-[#FEF4F7]">
                  <img src={step.icon} alt="" className="size-6" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-semibold leading-[28px] text-[#121212]">
                    {step.title}
                  </h3>
                  <p className="text-[16px] font-normal leading-[24px] text-[#807E7E]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps — Mobile: vertical timeline, reverse order, icons on the left */}
        <div className="mt-10 flex flex-col lg:hidden">
          {[...STEPS].reverse().map((step, i, arr) => (
            <div key={step.title} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FEF4F7]">
                  <img src={step.icon} alt="" className="size-4" />
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="w-px flex-1"
                    style={{ backgroundImage: DASH_V }}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 pb-8">
                <h3 className="text-[16px] font-semibold leading-[24px] text-[#121212]">
                  {step.title}
                </h3>
                <p className="text-[14px] font-normal leading-[24px] text-[#807E7E]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}