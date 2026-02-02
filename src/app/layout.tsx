import type { Metadata } from "next";
import { Inter, Bebas_Neue, Racing_Sans_One } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const racingSans = Racing_Sans_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-racing",
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
      <body className={`${inter.variable} ${bebasNeue.variable} ${racingSans.variable} font-sans antialiased bg-dark-900 text-white`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </body>
    </html>
  );
}
