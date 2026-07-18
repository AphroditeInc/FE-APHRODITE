"use client";

const PLATFORM_LINKS = ["For Divas/Hunks", "For Clients", "For AphroRyders"];
const LEGAL_LINKS = ["Terms of Service", "Privacy Policy", "Help Center"];

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-4 lg:w-[282px] lg:gap-6">
      <h4 className="text-[16px] font-semibold leading-[24px] text-white lg:text-[20px]">
        {title}
      </h4>
      <ul className="flex flex-col gap-4">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-[14px] leading-[24px] text-white/90 opacity-80 transition-opacity hover:opacity-100 lg:text-[18px] lg:leading-[35px]"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#FA266D] text-white">
      <div className="mx-auto max-w-[1248px] px-6 pt-10 lg:pt-16">
        {/* Top: logo + tagline, then Platform / Legal columns */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-0">
          <div className="flex flex-col gap-4 lg:w-[282px]">
            <div className="flex items-center gap-3">
              <img
                src="/footer/logo-white.svg"
                alt="Aphrodite Inc."
                className="h-6 w-[17px] lg:h-10 lg:w-[28px]"
              />
              <span className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.34px] text-white lg:text-[28px] lg:tracking-[-0.57px]">
                Aphrodite Inc.
              </span>
            </div>
            <p className="max-w-[282px] text-[16px] font-normal leading-[24px] text-white/90 opacity-80 lg:text-[18px] lg:leading-[35px]">
              Experience luxury, and discretion with Aphrodite&apos;s exclusive
              platform.
            </p>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row lg:gap-6">
            <FooterColumn title="Platform" links={PLATFORM_LINKS} />
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-6 border-t-[0.5px] border-dashed border-white/90 pb-10 pt-6 text-center lg:mt-20 lg:flex-row lg:justify-between lg:gap-0 lg:pb-16 lg:text-left">
          <p className="text-[14px] font-normal leading-[24px] text-white/90 opacity-80 lg:text-[18px] lg:leading-[35px]">
            © 2025 Aphrodite Inc. All Rights Reserved.
          </p>
          <div className="flex flex-col items-center gap-6 lg:flex-row">
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-normal text-white/90 opacity-80 lg:text-[18px]">
                Connect with us:
              </span>
              <div className="flex items-center gap-2 lg:gap-4">
                <a href="#" aria-label="Facebook">
                  <img src="/footer/social-facebook.svg" alt="" className="size-6 lg:size-7" />
                </a>
                <a href="#" aria-label="Instagram">
                  <img src="/footer/social-instagram.svg" alt="" className="size-6 lg:size-7" />
                </a>
                <a href="#" aria-label="X">
                  <img src="/footer/social-x.svg" alt="" className="size-6 lg:size-7" />
                </a>
              </div>
            </div>
            <a
              href="#"
              className="text-[14px] font-normal text-white/90 opacity-80 transition-opacity hover:opacity-100 lg:text-[18px]"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
