import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureBar from "@/components/FeatureBar";
import { Sparkles, Gem, Award, ShieldCheck, Heart, ArrowLeft, Target, Eye } from "lucide-react";

export const metadata = {
  title: "About Us | Insha Collections - Timeless • Elegant • You",
  description:
    "Learn about Insha Collections - our heritage, artisanal craftsmanship, anti-tarnish jewellery, pure silk handlooms, and premier salon experiences.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F3]">
      <Header />

      {/* Hero Banner */}
      <section className="relative w-full py-16 sm:py-24 bg-[#F5ECE5] border-b border-[#EAE2D8] overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A57D4E] uppercase hover:text-[#231610] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-[1px] w-12 bg-[#C5A47E]" />
            <span className="text-[#C5A47E] text-xs font-semibold tracking-[0.25em] uppercase">
              OUR HERITAGE
            </span>
            <div className="h-[1px] w-12 bg-[#C5A47E]" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#231610] font-serif-luxury tracking-wider uppercase leading-tight">
            ABOUT INSHA COLLECTIONS
          </h1>
          <p className="text-base sm:text-lg text-[#7A6F68] font-cormorant italic mt-3">
            Timeless • Elegant • You
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Brand Story */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#EAE2D8] shadow-sm space-y-4 text-[#5A4D45] text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#BA7442]" />
            The Insha Collections Story
          </h2>
          <p>
            Welcome to <strong className="text-[#231610]">Insha Collections</strong>, where royal heritage converges with modern luxury. Born from a deep appreciation for timeless Indian craft, artisanal weaves, anti-tarnish jewellery, and bespoke salon experiences, our collections are curated for the woman who values uncompromising elegance.
          </p>
          <p>
            From our signature <strong className="text-[#9C5A2C]">Anti-Tarnish Waterproof Jewellery</strong> crafted with advanced 18k and 22k PVD plating for continuous everyday wear, to handcrafted <strong className="text-[#9C5A2C]">Chanderi, Varanasi & Banarasi Silks</strong>, Korean hair aesthetics, readymade festive gowns, and our premier <strong className="text-[#9C5A2C]">Royal Beauty & Salon Suite</strong> — every offering is a celebration of fine living and regal charm.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE2D8] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#231610] uppercase tracking-wider font-sans">
              Our Mission
            </h3>
            <p className="text-sm text-[#7A6F68] leading-relaxed">
              To make heritage-grade luxury, waterproof anti-tarnish jewellery, and bespoke beauty care accessible to modern women across India through honest pricing, authentic artisan craft, and personalized client dedication.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE2D8] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#231610] uppercase tracking-wider font-sans">
              Our Vision
            </h3>
            <p className="text-sm text-[#7A6F68] leading-relaxed">
              To be India&apos;s most trusted and celebrated luxury lifestyle house, seamlessly bridging generational master-weaving traditions with cutting-edge anti-tarnish craftsmanship and world-class beauty services.
            </p>
          </div>
        </div>

        {/* 4 Brand Pillars */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase text-center">
            Our Quality Promise & Pillars
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D8] flex flex-col items-start space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
                <Gem className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-[#231610] uppercase tracking-wider font-sans">
                Anti-Tarnish Waterproof Jewellery
              </h4>
              <p className="text-xs sm:text-sm text-[#7A6F68] leading-relaxed">
                Engineered with titanium stainless steel cores and multi-layer 18k PVD gold plating. Completely waterproof, sweat-resistant, and hypoallergenic.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D8] flex flex-col items-start space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-[#231610] uppercase tracking-wider font-sans">
                Artisan Handlooms & Silks
              </h4>
              <p className="text-xs sm:text-sm text-[#7A6F68] leading-relaxed">
                Directly collaborating with master artisans across Varanasi, Chanderi, and Jaipur to preserve rare handloom traditions and promote sustainable weaving.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D8] flex flex-col items-start space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-[#231610] uppercase tracking-wider font-sans">
                Quality Guarantee
              </h4>
              <p className="text-xs sm:text-sm text-[#7A6F68] leading-relaxed">
                Every product undergoes strict multi-tier quality checks. Enjoy complete peace of mind with our 7-day hassle-free return and exchange guarantee.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D8] flex flex-col items-start space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-[#231610] uppercase tracking-wider font-sans">
                Customer Care & Salon Concierge
              </h4>
              <p className="text-xs sm:text-sm text-[#7A6F68] leading-relaxed">
                From bespoke bridal makeover packages to one-on-one virtual jewellery styling consultations, we ensure your shopping journey is nothing short of majestic.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeatureBar />
      <Footer />
    </main>
  );
}
