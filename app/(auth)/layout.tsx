"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import image1 from "../../public/images/slidersimage/firstimg.svg";
import image2 from "../../public/images/slidersimage/secondimg.svg";
import image3 from "../../public/images/slidersimage/thirdimg.svg";
import image4 from "../../public/images/slidersimage/fourthimg.svg";

interface AuthLayoutProps {
  children: ReactNode;
}

const images = [image1, image2, image3, image4];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background slider */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`Background ${index}`}
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Overlay for darkening / styling */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Auth container */}
      <div className="">{children}</div>
    </div>
  );
}
