"use client";

export default function ReadyToExperienceSection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1248px] px-6 py-10">
        {/* Pink gradient card */}
        <div
          className="relative overflow-hidden rounded-[30px] p-6 sm:p-10"
          style={{
            backgroundImage:
              "linear-gradient(103.79deg, #FA266D 36.82%, #FF6D9E 82.38%)",
          }}
        >
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
            {/* Left: copy + button */}
            <div className="flex w-full flex-col gap-8 lg:w-[474px] lg:gap-10">
              <div className="flex flex-col gap-4 text-white">
                <h2 className="text-[18px] font-semibold capitalize leading-[36px] sm:text-[40px] sm:leading-[56px]">
                  Ready to
                  <br />
                  Experience Luxury?
                </h2>
                <p className="text-[14px] font-normal leading-[28px] text-white sm:text-[20px] sm:leading-[35px]">
                  Join our exclusive community and discover what premium
                  companionship really means.
                </p>
              </div>
              <a
                href="/login"
                className="flex sm:h-14 h-10 w-[140px] sm:w-[173px] items-center justify-center gap-3 rounded-[50px] border-2 border-white/20 bg-white shadow-[0px_9px_10px_rgba(92,92,92,0.05)]"
              >
                <span className="whitespace-nowrap text-[14px] font-medium leading-[1.4] text-[#FA266D]">
                  Get started
                </span>
                <img src="/ready/icon-arrow.svg" alt="" className="size-4" />
              </a>
            </div>

            {/* Right: image with dark gradient at the bottom */}
            <div className="relative h-[220px] w-full overflow-hidden rounded-[15px] bg-white sm:h-[280px] lg:h-[315px] lg:w-[548px]">
              <img
                src="/ready/couple.webp"
                alt="Premium companionship experience"
                className="absolute inset-0 size-full object-cover object-bottom"
              />
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.8) 35.7%, rgba(0,0,0,0) 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
