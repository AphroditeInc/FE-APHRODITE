import React from "react";
import Image from "next/image";

function Logo() {
  return (
    <div className="flex items-center gap-[18px]">
      <Image src="/icons/logo.svg" alt="Aphrodite Logo" width={30} height={30} className="h-[30px] w-[30px]" />
      <span className="textlogo">Aphrodite</span>
    </div>
  );
}

export default Logo;
