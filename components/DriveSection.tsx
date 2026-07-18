"use client";

type Feature = {
  icon: string;
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  {
    icon: "/drive/icon-coin.svg",
    title: "Top Earnings",
    desc: "Earn up to $20/trip during peak times with premium service rates.",
  },
  {
    icon: "/drive/icon-clock.svg",
    title: "Flexible Hours",
    desc: "Drive when and where you want. Full control over your schedule.",
  },
  {
    icon: "/drive/icon-medal-star.svg",
    title: "Premium Routes",
    desc: "Access to high-value service requests in your area.",
  },
  {
    icon: "/drive/icon-star.svg",
    title: "5-Star Support",
    desc: "24/7 driver service & security support.",
  },
];

function FeatureCard({ icon, title, desc }: Feature) {
  return (
    <div className="relative h-[208px] w-full overflow-hidden rounded-[15px] border border-[#F6F6F6] lg:h-[216px] lg:rounded-[20px]">
      <div className="absolute left-[15px] top-[15px] flex size-10 items-center justify-center rounded-full bg-[#FEF4F7] lg:left-[23px] lg:size-16">
        <img src={icon} alt="" className="size-4 lg:size-8" />
      </div>
      <div className="absolute left-[15px] right-4 top-[79px] flex flex-col gap-2 lg:left-[23px] lg:top-[103px]">
        <h3 className="text-[16px] font-semibold leading-[32px] text-[#121212] lg:text-[20px]">
          {title}
        </h3>
        <p className="text-[12px] font-normal leading-[24px] text-[#807E7E] lg:text-[16px]">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function DriveSection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1248px] px-6 pb-10 pt-10 lg:pb-16 lg:pt-16">
        {/* Header */}
        <div className="mx-auto flex max-w-[588px] flex-col items-center gap-2 text-center lg:gap-4">
          <h2 className="text-[24px] font-bold leading-[40px] text-[#121212] lg:text-[40px] lg:leading-[48px]">
            Drive with <span className="text-[#FA266D]">Aphrodite</span>
            <br />
            Earn Money on Your Schedule
          </h2>
          <p className="text-[14px] font-normal leading-[24px] text-[#807E7E] opacity-80 lg:text-[18px] lg:leading-[35px]">
            Join thousands of AphroRyders earning competitive rates while
            providing premium transportation services. Your car, your time, your
            income.
          </p>
        </div>

        {/* Cards grid (left) + image (right) */}
        <div className="mt-10 flex flex-col gap-4 lg:mt-14 lg:flex-row lg:gap-6">
          <div className="grid grid-cols-2 gap-x-[15px] gap-y-4 lg:w-[588px] lg:gap-6">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
          <div className="relative h-[250px] w-full overflow-hidden rounded-[15px] bg-white lg:h-[456px] lg:w-[588px]">
            <img
              src="/drive/driver.webp"
              alt="Drive with Aphrodite"
              className="absolute inset-0 size-full object-cover object-center"
            />
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.8) 23%, rgba(0,0,0,0) 64%)",
              }}
            />
          </div>
        </div>

        {/* Join button */}
        <div className="mt-10 flex justify-center lg:mt-14">
          <a
            href="/login"
            className="flex h-10 w-[156px] items-center justify-center gap-3 rounded-[50px] border-2 border-white/20 shadow-[0px_9px_20px_rgba(85,156,255,0.2)] lg:h-14 lg:w-[217px]"
            style={{
              background:
                "linear-gradient(65.9deg, #FA266D 53.61%, #FF74A2 97.69%)",
            }}
          >
            <span className="whitespace-nowrap text-[12px] font-medium leading-[1.4] text-[#FAFAFB] lg:text-[16px]">
              Join as AphroRyder
            </span>
            <img src="/drive/icon-arrow.svg" alt="" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
