import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/utils/location/LocationProvider";
import { WeatherProvider } from "@/utils/weather/WeatherProvider";
import Header from "./components/Header/Header";
import { AuthProvider } from "@/utils/firebase/AuthProvider";
import Footer from "./components/Footer/page";

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
        <WeatherProvider>
          <AuthProvider>
            <body className={`${urbanist.className} min-h-screen flex flex-col`}>
              <Header />
              {children}
              <Footer />
            </body>
          </AuthProvider>
        </WeatherProvider>
      </LocationProvider>
    </html>
  );
}
