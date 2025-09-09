import Logo from "../logo";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function AuthCard({
  title,
  description,
  children,
  className = "",
}: AuthCardProps) {
  return (
    <div
      className={`relative bg-white/6 backdrop-blur-md rounded-[24px]  w-[586px] py-[40px]  mx-4 text-white border border-white/20 font-urbanist  ${className}`}
    >
      {/* Logo */}
      <div className="h-full flex flex-col justify-center w-[386px] mx-auto">
        <div className=" flex justify-center items-center">
          <Logo />
        </div>

        {/* Title & Description */}
        <div className="text-center mt-4 mb-6 w-[414px] mx-auto">
          <h1 className="text-[40px] font-bold mb-[16px] leading-[100%] tracking-[-0.02em]">
            {title}
          </h1>
          <div className="w-[386px] h-[42px] mx-auto">
            {description && (
              <p className="text-white/60 text-base font-medium leading-[130%] tracking-[-0.02em] text-center">
                {description}
              </p>
            )}
          </div>
        </div>
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
