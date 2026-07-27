import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { NEGOCIO, SITE_URL } from "@/lib/negocio";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Autosport Emanuel Berdullas | Vehículos 0KM y Usados",
    template: `%s | ${NEGOCIO.nombreCorto}`,
  },
  description: `${NEGOCIO.descripcion} ${NEGOCIO.direccion}, ${NEGOCIO.localidad}.`,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: NEGOCIO.nombre,
    title: "Autosport Emanuel Berdullas | Vehículos 0KM y Usados",
    description: NEGOCIO.descripcion,
    images: ["/images/logo.png"],
  },
};

const jsonLdAutoDealer = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: NEGOCIO.nombre,
  url: SITE_URL,
  image: `${SITE_URL}/images/logo.png`,
  telephone: `+${NEGOCIO.whatsapp}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: NEGOCIO.direccion,
    addressLocality: NEGOCIO.localidad,
    addressRegion: NEGOCIO.provincia,
    addressCountry: "AR",
  },
  sameAs: [NEGOCIO.instagram],
  openingHours: ["Mo-Fr 08:00-12:00", "Mo-Fr 16:00-20:00", "Sa 08:30-12:30"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${bebasNeue.variable} ${avantGarde.variable} font-sans antialiased bg-dark-900 text-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAutoDealer) }}
        />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
