"use client";

const SAFETY_TIPS = [
  "Trust your instincts and report any suspicious behavior",
  "Keep personal information private until you feel comfortable",
  "Use the platform's messaging system for all communications",
  "Report any violations of our community guidelines immediately",
];

type Contact = {
  icon: string;
  label: string;
  value: string;
  note: string;
};

const CONTACTS: Contact[] = [
  {
    icon: "/safety/icon-sms.svg",
    label: "Email",
    value: "aphroditeincorporation@gmail.com",
    note: "(24/7 Response within 24 hours)",
  },
  {
    icon: "/safety/icon-call.svg",
    label: "Phone",
    value: "+234 (813) 108 8821",
    note: "(24/7 Hotline)",
  },
];

function ContactRow({ icon, label, value, note }: Contact) {
  return (
    <div className="flex items-start gap-4 lg:items-center">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FEF4F7] lg:size-14">
        <img src={icon} alt="" className="size-4 lg:size-6" />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-[14px] font-semibold capitalize text-[#121212] lg:text-[16px]">
          {label}
        </p>
        <div className="flex flex-col gap-1 leading-[24px] lg:flex-row lg:items-center lg:gap-[10px]">
          <p className="text-[14px] text-[#807E7E] lg:text-[16px]">{value}</p>
          <p className="whitespace-nowrap text-[12px] text-[#FA266D]">{note}</p>
        </div>
      </div>
    </div>
  );
}

export default function SafetySection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1248px] px-6 pb-10 pt-10 lg:pb-16 lg:pt-16">
        {/* Header */}
        <div className="mx-auto flex max-w-[588px] flex-col items-center gap-2 text-center lg:gap-4">
          <h2 className="text-[24px] font-bold leading-[40px] text-[#121212] lg:text-[40px] lg:leading-[48px]">
            Your Safety, Our Priority
          </h2>
          <p className="text-[14px] font-normal leading-[24px] text-[#807E7E] opacity-80 lg:text-[18px] lg:leading-[35px]">
            We maintain the highest standards of safety and security to protect
            our community members.
          </p>
        </div>

        {/* Safety tips (left) + emergency contact box (right) */}
        <div className="mt-10 flex flex-col gap-10 lg:mt-14 lg:flex-row lg:items-start lg:gap-6">
          {/* Safety tips */}
          <div className="flex flex-col gap-4 lg:w-[588px] lg:gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/safety/icon-danger.svg"
                alt=""
                className="size-6 lg:size-8"
              />
              <h3 className="text-[16px] font-semibold leading-[24px] text-[#121212] lg:text-[20px]">
                Safety Tips
              </h3>
            </div>
            <ul className="list-disc pl-[21px] text-black lg:pl-6">
              {SAFETY_TIPS.map((tip) => (
                <li
                  key={tip}
                  className="text-[14px] leading-[24px] lg:text-[16px] lg:leading-[40px]"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency contact box */}
          <div className="rounded-[20px] bg-[#FCFCFC] p-4 lg:w-[588px] lg:p-6">
            <p className="text-[16px] font-semibold leading-[24px] text-[#FA266D] lg:text-[20px]">
              For Emergency Case
            </p>
            <div className="mt-4 flex flex-col gap-3 lg:mt-6 lg:gap-6">
              {CONTACTS.map((c) => (
                <ContactRow key={c.label} {...c} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
