"use client";

type Profile = {
  img: string;
  name: string;
  location: string;
  rating: string;
  // Exact per-card image framing ported from Figma: `outer` sizes/positions the
  // image frame within the 282x300 card; `inner` (when present) is the zoomed
  // photo inside an overflow-hidden crop box. When `inner` is null the photo is
  // a plain object-cover fill of the frame.
  outer: string;
  inner: string | null;
};

const PROFILES: Profile[] = [
  { img: "/explore/p1.webp", name: "Bellaposh", location: "Lagos Island", rating: "5.0", outer: "-translate-x-1/2 -translate-y-1/2 h-[356.585px] left-[calc(50%+0.5px)] top-[calc(50%+0.29px)] w-[281px]", inner: "h-[133.44%] left-0 top-[-16.71%] w-full" },
  { img: "/explore/p2.webp", name: "Sweetym", location: "Lekki", rating: "4.9", outer: "-translate-x-1/2 h-[355.975px] left-[calc(50%-0.5px)] top-[-20px] w-[283px]", inner: "h-[109.37%] left-[-10.69%] top-[-9.25%] w-[121.38%]" },
  { img: "/explore/p3.webp", name: "Elina", location: "Abeokuta", rating: "4.9", outer: "h-[354.717px] left-0 top-[-42px] w-[282px]", inner: "h-[141.38%] left-0 top-[-26%] w-full" },
  { img: "/explore/p4.webp", name: "Bigslut", location: "Port-Harcourt", rating: "4.7", outer: "h-[355.836px] left-0 top-[-6px] w-[282px]", inner: "h-full left-[-11.9%] top-0 w-[124.11%]" },
  { img: "/explore/p5.webp", name: "Busty Queen", location: "Ikeja", rating: "4.5", outer: "-translate-y-1/2 h-[355.975px] left-[-1px] top-[calc(50%-0.01px)] w-[283px]", inner: "h-[106%] left-0 top-[-6%] w-full" },
  { img: "/explore/p6.webp", name: "Josh Dee", location: "Abuja", rating: "4.5", outer: "h-[355.696px] left-px top-0 w-[281px]", inner: "h-[118.5%] left-0 top-[-9.25%] w-full" },
  { img: "/explore/p7.webp", name: "Iniie🍑🍆", location: "Alimosho", rating: "4.5", outer: "h-[355.696px] left-px top-0 w-[281px]", inner: "h-[122.45%] left-0 top-[-20.5%] w-full" },
  { img: "/explore/p8.webp", name: "Lush Baby", location: "Ibadan", rating: "4.3", outer: "-translate-x-1/2 h-[355.836px] left-1/2 top-0 w-[282px]", inner: "h-[133.5%] left-[-12.93%] top-[-31%] w-[126.34%]" },
  { img: "/explore/p9.webp", name: "Pookie", location: "Lekki", rating: "4.2", outer: "bottom-[-24px] h-[376px] left-0 w-[282px]", inner: null },
  { img: "/explore/p10.webp", name: "Kimmy", location: "Benin City", rating: "4.0", outer: "-translate-x-1/2 -translate-y-1/2 h-[354.717px] left-1/2 top-[calc(50%+0.36px)] w-[282px]", inner: "h-[141.38%] left-0 top-[-39%] w-full" },
  { img: "/explore/p11.webp", name: "Diggie", location: "Victoria Island", rating: "4.0", outer: "h-[423px] left-0 top-[-45px] w-[282px]", inner: null },
  { img: "/explore/p12.webp", name: "Laura", location: "Ikeja", rating: "4.0", outer: "-translate-x-1/2 bottom-0 h-[376px] left-1/2 w-[282px]", inner: null },
];

function ProfileCard({ img, name, location, rating, outer, inner }: Profile) {
  return (
    <div className="relative h-[300px] w-[282px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-white lg:w-full">
      <div className={`absolute ${outer}`}>
        {inner ? (
          <div className="absolute inset-0 overflow-hidden">
            <img src={img} alt={name} className={`absolute max-w-none ${inner}`} />
          </div>
        ) : (
          <img
            src={img}
            alt={name}
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        )}
      </div>
      {/* Glassmorphic info panel */}
      <div className="absolute bottom-4 left-1/2 h-[93px] w-[250px] max-w-[calc(100%-32px)] -translate-x-1/2 overflow-hidden rounded-[16px] bg-white/[0.06] backdrop-blur-[34px]">
        {/* Name + location */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="whitespace-nowrap text-[18px] font-semibold text-white">
              {name}
            </p>
            <img src="/explore/icon-verify.svg" alt="verified" className="size-4 shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <img src="/explore/icon-location.svg" alt="" className="size-6 shrink-0" />
            <p className="whitespace-nowrap text-[14px] font-normal tracking-[-0.28px] text-white/60">
              {location}
            </p>
          </div>
        </div>
        {/* Heart */}
        <img
          src="/explore/icon-heart.svg"
          alt="favorite"
          className="absolute right-4 top-[19px] size-6"
        />
        {/* Rating */}
        <div className="absolute right-4 top-[56px] flex items-center gap-1">
          <img src="/explore/icon-star.svg" alt="" className="size-4 shrink-0" />
          <p className="whitespace-nowrap text-[14px] font-normal italic tracking-[-0.28px] text-white">
            {rating}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExploreSection() {
  return (
    <section id="explore-verified" className="w-full bg-white">
      <div className="mx-auto max-w-[1248px] px-6 pb-16 pt-16">
        {/* Header */}
        <div className="mx-auto flex w-full max-w-[588px] flex-col items-center gap-4 text-center">
          <h2 className="text-[22px] font-bold leading-[40px] sm:text-[40px] sm:leading-[48px]">
            <span className="text-[#121212]">Explore Verified </span>
            <span className="text-[#FA266D]">Divas/Hunks</span>
          </h2>
          <p className="text-[14px] font-normal leading-[30px] text-[#807E7E] opacity-80 sm:text-[18px] sm:leading-[35px]">
            Explore the list of verified, top-rated and trusted experts
            handpicked for your premium experience.
          </p>
        </div>

        {/* Mobile/tablet: horizontal snap-scroll carousel (swipe right for more).
            Desktop (lg+): exact 4x3 grid. -mx-6/px-6 lets cards scroll edge-to-edge
            on mobile while the first card still aligns with the header. */}
        <div className="mt-10 -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {PROFILES.map((p) => (
            <ProfileCard key={p.name} {...p} />
          ))}
        </div>

        {/* See more button */}
        <div className="mt-20 flex justify-center">
          <a
            href="#"
            className="flex h-14 w-[173px] items-center justify-center gap-3 rounded-[50px] border-2 border-white/20 shadow-[0px_9px_20px_0px_rgba(85,156,255,0.2)]"
            style={{
              background:
                "linear-gradient(70.38deg, #FA266D 53.61%, #FF74A2 97.69%)",
            }}
          >
            <span className="whitespace-nowrap text-[16px] font-medium leading-[1.4] text-[#FAFAFB]">
              See more
            </span>
            <img src="/explore/icon-arrow.svg" alt="" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
