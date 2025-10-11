import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { ApiProvider } from "../lib/context/ApiContext";

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
      <body
        className={`${urbanist.variable} antialiased`}
      >
        <ApiProvider>
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}
