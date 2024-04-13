import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/utils/location/LocationProvider";

const urbanist = Urbanist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Playdate",
  description: "Helping parents plan for their kids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <LocationProvider>
        <body className={urbanist.className}>{children}</body>
      </LocationProvider>
    </html>
  );
}
