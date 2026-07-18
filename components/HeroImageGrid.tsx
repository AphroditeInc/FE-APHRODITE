"use client";

import { useEffect, useState } from "react";

const imgImage = "/hero-grid/image.webp";
const imgImage1 = "/hero-grid/image1.webp";
const imgImage2 = "/hero-grid/image2.webp";
const imgImage15 = "/hero-grid/image15.webp";
const imgImage3 = "/hero-grid/image3.webp";
const imgImage4 = "/hero-grid/image4.webp";
const imgImage5 = "/hero-grid/image5.webp";
const imgImage28 = "/hero-grid/image28.webp";
const imgImage6 = "/hero-grid/image6.webp";
const imgImage7 = "/hero-grid/image7.webp";
const imgImage19 = "/hero-grid/image19.webp";
const imgImage8 = "/hero-grid/image8.webp";
const imgImage9 = "/hero-grid/image9.webp";
const imgImage10 = "/hero-grid/image10.webp";
const imgImage23 = "/hero-grid/image23.webp";
const imgImage11 = "/hero-grid/image11.webp";
const imgImage12 = "/hero-grid/image12.webp";
const imgImage20 = "/hero-grid/image20.webp";
const imgImage13 = "/hero-grid/image13.webp";
const imgImage31 = "/hero-grid/image31.webp";
const imgImage14 = "/hero-grid/image14.webp";
const imgImage25 = "/hero-grid/image25.webp";
const imgImage16 = "/hero-grid/image16.webp";
const imgImage17 = "/hero-grid/image17.webp";
const imgImage26 = "/hero-grid/image26.webp";
const imgImage18 = "/hero-grid/image18.webp";
const imgImage21 = "/hero-grid/image21.webp";
const imgImage22 = "/hero-grid/image22.webp";
const imgImage24 = "/hero-grid/image24.webp";
const imgImage29 = "/hero-grid/image29.webp";
const imgImage27 = "/hero-grid/image27.webp";
const imgImage30 = "/hero-grid/image30.webp";
const imgImage32 = "/hero-grid/image32.webp";
const imgImage33 = "/hero-grid/image33.webp";
const imgImage34 = "/hero-grid/image34.webp";
const imgImage35 = "/hero-grid/image35.webp";
const imgImage36 = "/hero-grid/image36.webp";
const imgImage37 = "/hero-grid/image37.webp";
const imgImage38 = "/hero-grid/image38.webp";
const imgImage39 = "/hero-grid/image39.webp";
const imgImage40 = "/hero-grid/image40.webp";
const imgImage41 = "/hero-grid/image41.webp";
const imgImage42 = "/hero-grid/image42.webp";
const imgImage43 = "/hero-grid/image43.webp";
const imgImage44 = "/hero-grid/image44.webp";
const imgImage45 = "/hero-grid/image45.webp";
const imgImage46 = "/hero-grid/image46.webp";
const imgImage47 = "/hero-grid/image47.webp";

// Ported 1:1 from the Figma "image grid" node (564:4105) at its native 1440x1024
// design size. The grid lives in a FIXED 1440x1024 box so every tile's
// mixed px/% coordinates resolve exactly as they do in Figma; that whole box is
// then uniformly scaled (like background-size: cover) to fill any viewport, so
// the columns never spread apart and leave gaps at wide screen sizes.
export default function HeroImageGrid() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () =>
      setScale(Math.max(window.innerWidth / 1440, window.innerHeight / 1024));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute left-1/2 top-1/2 h-[1024px] w-[1440px]"
        style={{
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <div className="absolute contents h-[1136.52px] left-[-159.54px] top-[-56.24px] w-[1759.046px]">
          <div className="absolute flex h-[276.598px] items-center justify-center left-[-131.35px] top-[-56.23px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[83.34px] top-[-48.74px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[215.808px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(12.5%+119.01px)] top-[-41.21px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[214.818px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[214.818px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[363.955px] left-[calc(50%+5.25px)] top-[calc(50%-47.32px)] w-[289.344px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[106%] left-0 max-w-none top-[-6%] w-full" src={imgImage15} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(25%+153.7px)] top-[-33.71px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[274.875px] left-[calc(50%-0.43px)] top-[calc(50%-0.35px)] w-[412.312px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage4} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(50%+9.38px)] top-[-26.18px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage5} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[284.56px] left-[calc(50%-5.35px)] top-[calc(50%+0.28px)] w-[226.141px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage28} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(62.5%+45.06px)] top-[-18.65px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage6} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(75%+79.74px)] top-[-11.15px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage7} />
                </div>
                <div className="-translate-x-1/2 absolute h-[312.39px] left-1/2 top-[-6.31px] w-[247.569px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-full left-[-11.9%] max-w-none top-0 w-[124.11%]" src={imgImage19} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(100%-64.58px)] top-[-3.62px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage8} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[-140.75px] top-[212.87px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage9} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[73.94px] top-[220.36px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage10} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[373.097px] left-1/2 top-[calc(50%+23.52px)] w-[296.612px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[141.38%] left-0 max-w-none top-[-39%] w-full" src={imgImage23} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(12.5%+109.62px)] top-[227.9px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage11} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(25%+144.31px)] top-[235.34px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage12} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[279.783px] left-[calc(50%-0.36px)] top-[calc(50%+0.05px)] w-[221.029px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[118.5%] left-0 max-w-none top-[-9.25%] w-full" src={imgImage20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(50%-0.02px)] top-[242.92px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[101.92%] left-[-2.29%] max-w-none top-[-0.96%] w-[104.59%]" src={imgImage13} />
                  </div>
                </div>
                <div className="-translate-x-1/2 absolute bottom-[-46.28px] h-[395.483px] left-[calc(50%+0.43px)] w-[296.612px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage31} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(62.5%+35.66px)] top-[250.46px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[214.818px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[214.818px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage14} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[395.483px] left-[calc(50%-0.31px)] top-[calc(50%+11.57px)] w-[296.612px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage25} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(100%-74.97px)] top-[265.45px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[215.808px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage16} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(75%+70.35px)] top-[257.95px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[214.818px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[214.818px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage17} />
                </div>
                <div className="-translate-x-1/2 absolute h-[403.898px] left-[calc(50%+0.5px)] top-0 w-[320.089px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[133.5%] left-[-12.93%] max-w-none top-[-31%] w-[126.34%]" src={imgImage26} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[-150.14px] top-[481.97px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage6} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[64.54px] top-[489.46px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage18} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[323.986px] left-[calc(50%-0.53px)] top-[calc(50%-0.01px)] w-[257.569px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[109.37%] left-[-10.69%] max-w-none top-[-9.25%] w-[121.38%]" src={imgImage21} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(12.5%+100.22px)] top-[497px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage22} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(25%+134.91px)] top-[504.49px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage24} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[280.835px] left-[calc(50%-0.29px)] top-[calc(50%+5.78px)] w-[223.264px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[141.38%] left-0 max-w-none top-[-28.25%] w-full" src={imgImage29} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(50%-9.42px)] top-[512.02px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage27} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[268.564px] left-[calc(50%-69.51px)] top-[calc(50%-0.35px)] w-[402.846px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage30} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(62.5%+26.26px)] top-[519.56px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[214.818px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[214.818px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage32} />
                </div>
                <div className="-translate-x-1/2 absolute h-[319.752px] left-[calc(50%+10.84px)] top-0 w-[252.604px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[122.45%] left-0 max-w-none top-[-20.5%] w-full" src={imgImage33} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(75%+60.95px)] top-[527.05px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage34} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[281.887px] left-[calc(50%-0.53px)] top-[calc(50%-6.31px)] w-[222.135px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[133.44%] left-0 max-w-none top-[-16.71%] w-full" src={imgImage35} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(100%-83.37px)] top-[534.59px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage36} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[-159.54px] top-[751.07px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage17} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[55.15px] top-[758.57px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage37} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[268.564px] left-1/2 top-[calc(50%-0.35px)] w-[402.846px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage38} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(12.5%+90.82px)] top-[766.1px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage39} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(25%+125.51px)] top-[773.59px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[215.808px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage40} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(37.5%+161.19px)] top-[781.13px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[215.808px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[215.808px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage41} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[335.705px] left-[calc(50%-0.16px)] top-[calc(50%-16.22px)] w-[251.779px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage42} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(62.5%+16.86px)] top-[788.66px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] overflow-clip relative w-[214.818px]">
                <div className="absolute h-[269.265px] left-0 top-0 w-[214.818px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage43} />
                </div>
                <div className="-translate-x-1/2 absolute h-[444.919px] left-[calc(50%-0.31px)] top-[-52.59px] w-[296.612px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage44} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.633px] items-center justify-center left-[calc(75%+51.55px)] top-[796.16px] w-[225.074px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[215.808px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
              </div>
            </div>
          </div>
          <div className="absolute flex h-[276.598px] items-center justify-center left-[calc(100%-92.77px)] top-[803.69px] w-[224.085px]">
            <div className="flex-none rotate-2">
              <div className="h-[269.265px] relative w-[214.818px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage45} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex h-[276.532px] items-center justify-center left-[calc(12.5%+110.17px)] top-[227.86px] w-[223.757px]">
          <div className="flex-none rotate-2">
            <div className="h-[269.21px] overflow-clip relative w-[214.492px]">
              <div className="absolute h-[269.21px] left-0 top-0 w-[214.492px]">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 overflow-hidden">
                    <img alt="" className="absolute h-full left-[-8.94%] max-w-none top-0 w-[117.88%]" src={imgImage11} />
                  </div>
                  <div className="absolute inset-0 overflow-hidden">
                    <img alt="" className="absolute h-[195.53%] left-[-175.97%] max-w-none top-[-95.53%] w-[353.04%]" src={imgImage46} />
                  </div>
                </div>
              </div>
              <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[373.097px] left-[calc(50%-0.08px)] top-[calc(50%+0.46px)] w-[296.612px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[141.38%] left-0 max-w-none top-[-26%] w-full" src={imgImage47} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
