import React from "react";
import Image from "next/image";
import logos from "../public/icons/logo.svg";

function Logo() {
  return (
    <div className="flex items-center gap-[18px]">
      <Image src={logos} alt="logo" className="h-[30px] w-[30px]" />
      <span className="textlogo  ">Aphrodite</span>
    </div>
  );
}

export default Logo;
