import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Montserrat } from "next/font/google";
import FloatingContactButton from "@/components/FloatingContactButton";
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
  title: "Insha Collections | Timeless • Elegant • You",
  description:
    "Timeless, elegant anti-tarnish luxury jewellery, Korean accessories, readymade dresses, silk materials, handlooms, and premier salon experiences by Insha Collections.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
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
        <FloatingContactButton />
      </body>
    </html>
  );
}
