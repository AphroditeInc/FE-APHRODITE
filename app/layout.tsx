import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../components/providers/ReduxProvider";
import { ApiProvider } from "@/lib/context/ApiContext";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Aphrodite",
  description: "Find your perfect match for any service or talent you need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dpynyht1l/image/upload/f_auto,q_auto,w_1920,h_1080,c_fill/v1760294571/image_grid_kib4ze.png"
        />
      </head>
      <body
        className={`${urbanist.variable} antialiased`}
      >
        <ReduxProvider>
          <ApiProvider>
            {children}
          </ApiProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
