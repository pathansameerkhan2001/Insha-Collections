import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Insha Collections | Anti Tarnish Luxury Jewellery",
  description:
    "Timeless, elegant anti-tarnish luxury jewellery by Insha Collections. Elegance that lasts.",
  icons: {
    icon: "/images/New-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${montserrat.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#FAF7F3] text-[#231610] font-sans selection:bg-[#C5A57E]/20 selection:text-[#231610]">
        {children}
      </body>
    </html>
  );
}
