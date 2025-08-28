import Logo from "../logo";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <div className="bg-white/6 backdrop-blur-md rounded-2xl px-[90px] py-[40px]  max-w-[586px] w-full text-white">
      {/* Logo */}
      <div>
        <div className=" flex justify-center items-center">
          <Logo />
        </div>

        {/* Title & Description */}
        <div className="text-center mt-4 mb-6">
          <h1 className="text-[40px] font-bold mb-2">{title}</h1>
          {description && <p className="text-white/60 mb-6">{description}</p>}
        </div>
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
