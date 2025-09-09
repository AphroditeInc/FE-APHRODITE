"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const images = [
  "/images/slidersimage/firstimg.svg",
  "/images/slidersimage/secondimg.svg",
  "/images/slidersimage/thirdimg.svg",
  "/images/slidersimage/fourthimg.svg",
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden font-urbanist">
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
