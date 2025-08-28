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
    <div className={`bg-white/6 backdrop-blur-md rounded-2xl p-10 max-w-lg w-full text-white ${className}`}>
      {/* Logo */}
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
  );
}
