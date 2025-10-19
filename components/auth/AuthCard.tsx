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
      className={`relative bg-white/6 backdrop-blur-md rounded-[20px] sm:rounded-[24px] w-full max-w-[586px] py-6 sm:py-8 lg:py-[40px] mx-4 text-white border border-white/20 font-urbanist ${className}`}
    >
      {/* Logo */}
      <div className="h-full flex flex-col justify-center w-full max-w-[386px] mx-auto px-4 sm:px-0">
        <div className="flex justify-center items-center">
          <Logo />
        </div>

        {/* Title & Description */}
        <div className="text-center mt-4 mb-6 w-full">
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold mb-3 sm:mb-4 lg:mb-[16px] leading-tight tracking-[-0.02em]">
            {title}
          </h1>
          <div className="w-full max-w-[386px] mx-auto">
            {description && (
              <p className="text-white/60 text-sm sm:text-base font-medium leading-[130%] tracking-[-0.02em] text-center">
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
