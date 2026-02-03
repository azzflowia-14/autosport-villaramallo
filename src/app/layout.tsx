import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const avantGarde = localFont({
  src: "../../public/fonts/ITCAvantGardeStd-Bold.woff2",
  variable: "--font-avant-garde",
});

export const metadata: Metadata = {
  title: "Autosport Villa Ramallo | Vehículos 0KM y Usados",
  description: "Venta de vehículos 0km y usados en Villa Ramallo. Financiación, transferencias y el mejor servicio. Av. J. Newbery 345, V. Ramallo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${bebasNeue.variable} ${avantGarde.variable} font-sans antialiased bg-dark-900 text-white`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
