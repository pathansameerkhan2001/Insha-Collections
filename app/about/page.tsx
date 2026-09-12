import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureBar from "@/components/FeatureBar";
import { ArrowLeft, Quote, Sparkles, Heart, ShoppingBag, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Our Story | Insha Collections — A Journey Built on Trust",
  description:
    "Discover the story of Insha Collections — from our humble beginnings in 2018 at RV Nagar, Kadapa, to our flagship store at YV Street, Kadapa Bazaar, and our online shopping destination.",
};

const timelineMilestones = [
  {
    period: "2018",
    emoji: "🌱",
    title: "A simple beginning",
    description: "A simple beginning in RV Nagar, Kadapa",
    highlight: "Where our journey started",
  },
  {
    period: "The Journey",
    emoji: "🤝",
    title: "Growing through relationships",
    description: "Growing through customers, relationships and experience",
    highlight: "Building trust day by day",
  },
  {
    period: "2026",
    emoji: "✨",
    title: "A new chapter",
    description: "A new chapter at YV Street, Kadapa Bazaar",
    highlight: "Flagship retail experience",
  },
  {
    period: "Today",
    emoji: "🛍️",
    title: "Expanding online",
    description: "Insha Collections expands into the online shopping world",
    highlight: "Reaching customers everywhere",
  },
  {
    period: "Tomorrow",
    emoji: "🌸",
    title: "Bigger dreams",
    description: "Bigger dreams. Better collections. More ways to be part of your everyday moments.",
    highlight: "Only the beginning",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F3] text-[#231610] selection:bg-[#C5A57E]/20 selection:text-[#231610]">
      <Header />

      {/* ========================================================================= */}
      {/* 1. HERO HEADER SECTION                                                    */}
      {/* ========================================================================= */}
      <section className="relative w-full py-14 sm:py-20 md:py-24 bg-gradient-to-b from-[#F5ECE5] via-[#FAF6F0] to-[#FAF7F3] border-b border-[#EAE2D8] overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#E6D5C3]/40 to-transparent blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.16em] text-[#BA7442] uppercase hover:text-[#231610] mb-6 sm:mb-8 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          {/* Subheading badge with delicate gold accents */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-8 sm:w-14 bg-[#C5A47E]" />
            <span className="text-[#A57D4E] text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase font-sans">
              OUR STORY
            </span>
            <div className="h-[1px] w-8 sm:w-14 bg-[#C5A47E]" />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase leading-tight sm:leading-snug max-w-3xl mx-auto">
            INSHA COLLECTIONS — A Journey Built on Trust
          </h1>

          <p className="text-base sm:text-xl text-[#7A6F68] font-cormorant italic mt-3 sm:mt-4 max-w-xl mx-auto">
            From a small beginning in Kadapa to a cherished destination for elegance and confidence.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN STORY EDITORIAL CONTENT                                           */}
      {/* ========================================================================= */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 space-y-12 sm:space-y-16">
        
        {/* SECTION: OUR STORY */}
        <section className="space-y-6 sm:space-y-7">
          <div className="space-y-4 text-[14.5px] sm:text-[16px] text-[#4A3D35] leading-relaxed font-sans">
            <p className="text-lg sm:text-xl text-[#231610] font-serif-luxury tracking-wide leading-snug">
              Every brand has a beginning.
            </p>
            <p>
              Ours began with a simple idea — to create a place where people could discover beautiful things, feel valued, and shop with confidence.
            </p>
            <p>
              In 2018, <strong className="text-[#231610] font-semibold">Insha Collections</strong> started its journey in <strong className="text-[#231610] font-semibold">RV Nagar, Kadapa</strong>. It wasn&apos;t about starting something big overnight. It was about taking one small step, serving one customer at a time, learning from every experience, and slowly building something we could be proud of.
            </p>
            <p className="text-[#231610] font-medium pt-1">
              From the very beginning, our belief was simple:
            </p>
          </div>

          {/* EDITORIAL QUOTE BLOCK */}
          <div className="relative my-6 sm:my-8 p-6 sm:p-8 md:p-10 rounded-2xl bg-[#F5ECE5]/80 border border-[#D5C2AF]/80 shadow-xs">
            <div className="absolute -top-3.5 left-6 sm:left-8 bg-[#BA7442] text-white p-1.5 rounded-full shadow-xs">
              <Quote className="w-4 h-4 fill-white stroke-none" />
            </div>
            <blockquote className="text-lg sm:text-xl md:text-2xl font-normal text-[#231610] font-cormorant italic leading-relaxed sm:leading-normal">
              “When customers choose you, they are giving you more than a sale — they are giving you their trust.”
            </blockquote>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#BA7442] uppercase font-sans mt-3">
              The Foundation of Insha Collections
            </p>
          </div>

          <p className="text-[14.5px] sm:text-[16px] text-[#4A3D35] leading-relaxed font-sans">
            That belief became the foundation of Insha Collections.
          </p>
        </section>

        {/* ELEGANT SECTION DIVIDER */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
          <span className="text-[#BA7442] text-[10px] select-none">◆</span>
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
        </div>

        {/* SECTION: GROWING WITH OUR CUSTOMERS */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl select-none" role="img" aria-label="Sprout">🌿</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
              Growing With Our Customers
            </h2>
          </div>

          <div className="space-y-4 text-[14.5px] sm:text-[16px] text-[#4A3D35] leading-relaxed font-sans">
            <p>
              As the years passed, our collections grew, our experience grew, and most importantly, our relationship with our customers grew.
            </p>
            <p>
              Every visit, every recommendation, every returning customer and every kind word became part of our story.
            </p>
            <p className="font-medium text-[#231610] pt-1">
              We understood that shopping is not just about a product.
            </p>

            {/* Micro value highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 sm:my-6">
              <div className="p-4 rounded-xl bg-white border border-[#EAE2D8] shadow-2xs space-y-1">
                <span className="text-[#BA7442] text-xs font-semibold tracking-wider uppercase font-sans block">Style & Feel</span>
                <p className="text-sm text-[#3D312A]">It&apos;s about finding something that feels right and discovering a style you love.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#EAE2D8] shadow-2xs space-y-1">
                <span className="text-[#BA7442] text-xs font-semibold tracking-wider uppercase font-sans block">Everyday Moments</span>
                <p className="text-sm text-[#3D312A]">It&apos;s about finding something beautiful for an important occasion, or simply making your day a little better.</p>
              </div>
            </div>

            <p className="italic text-[#5A4D45] font-serif">
              That&apos;s the experience we always wanted Insha Collections to offer.
            </p>
          </div>
        </section>

        {/* ELEGANT SECTION DIVIDER */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
          <span className="text-[#BA7442] text-[10px] select-none">◆</span>
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
        </div>

        {/* SECTION: 2026 — A NEW CHAPTER */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl select-none" role="img" aria-label="Sparkles">✨</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
              2026 — A New Chapter
            </h2>
          </div>

          <div className="space-y-4 text-[14.5px] sm:text-[16px] text-[#4A3D35] leading-relaxed font-sans">
            <p>
              After years of growing as a local business, 2026 became a special milestone for us.
            </p>
            <p>
              We stepped into a new chapter at <strong className="text-[#231610] font-semibold">YV Street, Kadapa Bazaar</strong> — bringing a refreshed Insha Collections experience while carrying the memories and trust built from where our journey began.
            </p>
            <p>
              But we knew our customers were changing too.
            </p>
            <p>
              People were discovering products online, comparing choices, shopping from their phones and expecting convenience along with quality.
            </p>
            <p className="text-[#231610] font-medium pt-1">
              So we decided to take another important step.
            </p>
          </div>

          {/* SUBSECTION: INSHA COLLECTIONS ONLINE */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#FAF2EB] via-white to-[#FAF6F0] border border-[#D5C2AF] shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none" role="img" aria-label="Shopping Bag">🛍️</span>
              <h3 className="text-lg sm:text-xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
                Insha Collections Online
              </h3>
            </div>

            <p className="text-[14.5px] sm:text-[15.5px] text-[#4A3D35] leading-relaxed">
              We launched our own e-commerce website to bring our collections beyond the walls of our store.
            </p>
            <p className="text-[14.5px] sm:text-[15.5px] text-[#4A3D35] leading-relaxed">
              Now, our journey that started locally in Kadapa can reach customers wherever they are.
            </p>

            {/* 4 Action Words Row */}
            <div className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                {["Browse", "Discover", "Choose", "Shop"].map((action) => (
                  <div
                    key={action}
                    className="py-2.5 px-3 rounded-xl bg-white border border-[#EAE2D8] shadow-2xs font-serif-luxury text-xs sm:text-sm font-semibold tracking-wider text-[#231610] uppercase"
                  >
                    {action}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs sm:text-sm font-semibold text-[#BA7442] tracking-[0.2em] uppercase font-sans mt-4">
                Anytime. Anywhere.
              </p>
            </div>
          </div>
        </section>

        {/* ELEGANT SECTION DIVIDER */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
          <span className="text-[#BA7442] text-[10px] select-none">◆</span>
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
        </div>

        {/* SECTION: WHAT HAS NEVER CHANGED */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl select-none" role="img" aria-label="Red Heart">❤️</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
              What Has Never Changed
            </h2>
          </div>

          <div className="space-y-4 text-[14.5px] sm:text-[16px] text-[#4A3D35] leading-relaxed font-sans">
            <div className="space-y-1.5 text-[#5A4D45]">
              <p>Our location changed.</p>
              <p>Our collections evolved.</p>
              <p>Our technology changed.</p>
              <p className="font-semibold text-[#231610] pt-1 text-base sm:text-lg">
                But our values didn&apos;t.
              </p>
            </div>

            <p>
              We still believe in choosing products thoughtfully, creating a pleasant shopping experience, offering value, and treating every customer with the same warmth with which we started.
            </p>
            <p className="text-[#231610] font-medium">
              Because behind every order is a person who chose Insha Collections.
            </p>
            <p className="font-serif italic text-base sm:text-lg text-[#BA7442]">
              And that means something to us.
            </p>
          </div>
        </section>

        {/* ELEGANT SECTION DIVIDER */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
          <span className="text-[#BA7442] text-[10px] select-none">◆</span>
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
        </div>

        {/* ========================================================================= */}
        {/* 3. TIMELINE SECTION: FROM 2018 TO TODAY                                   */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#BA7442] text-xs font-semibold tracking-[0.24em] uppercase font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE INSHA JOURNEY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
              From 2018 to Today
            </h2>
          </div>

          {/* DESKTOP TIMELINE (>= 768px) */}
          <div className="hidden md:block">
            <div className="relative border-l-2 border-[#D5C2AF] ml-6 pl-8 space-y-8 my-6">
              {timelineMilestones.map((item) => (
                <div key={item.period} className="relative group">
                  {/* Step Node Icon */}
                  <div className="absolute -left-[49px] top-0 w-8 h-8 rounded-full bg-[#FAF7F3] border-2 border-[#BA7442] text-[#231610] flex items-center justify-center text-sm shadow-xs group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>

                  {/* Content card */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D8] shadow-2xs hover:border-[#BA7442]/60 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-[0.18em] text-[#BA7442] uppercase font-sans">
                        {item.period}
                      </span>
                      <span className="text-[11px] text-[#8C7E75] font-serif italic">
                        {item.highlight}
                      </span>
                    </div>
                    <p className="text-base font-medium text-[#231610] leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE VERTICAL TIMELINE (< 768px) */}
          <div className="block md:hidden">
            <div className="relative border-l-2 border-[#D5C2AF] ml-4 pl-5 space-y-6 my-4">
              {timelineMilestones.map((item) => (
                <div key={item.period} className="relative">
                  {/* Circular Node */}
                  <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-[#FAF7F3] border-2 border-[#BA7442] text-xs flex items-center justify-center shadow-2xs">
                    <span className="text-[11px] leading-none">{item.emoji}</span>
                  </div>

                  {/* Milestone Card */}
                  <div className="bg-white p-4 rounded-xl border border-[#EAE2D8] shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-[0.18em] text-[#BA7442] uppercase font-sans">
                        {item.period}
                      </span>
                      <span className="text-[10px] text-[#8C7E75] font-serif italic">
                        {item.highlight}
                      </span>
                    </div>
                    <p className="text-[13.5px] font-medium text-[#231610] leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ELEGANT SECTION DIVIDER */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
          <span className="text-[#BA7442] text-[10px] select-none">◆</span>
          <div className="h-[1px] flex-1 max-w-[140px] bg-[#E2D6C8]" />
        </div>

        {/* ========================================================================= */}
        {/* 4. OUR PROMISE & CLOSING THANK YOU                                        */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#231610] font-serif-luxury tracking-wide uppercase text-center">
              Our Promise
            </h2>
            <div className="space-y-3 text-[14.5px] sm:text-[16px] text-[#4A3D35] leading-relaxed font-sans text-center max-w-2xl mx-auto">
              <p>
                We don&apos;t want to be remembered simply as a store where you bought something.
              </p>
              <p>
                We want to be the place you think of when you&apos;re looking for something beautiful, something special, or simply something you love.
              </p>
              <p className="text-[#231610] font-medium">
                From a small beginning in Kadapa to a growing online destination, Insha Collections is still on the same journey — just moving forward, one customer at a time.
              </p>
            </div>
          </div>

          {/* LUXURY CLOSING CARD */}
          <div className="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-white via-[#FAF6F0] to-[#F5ECE5] border border-[#D5C2AF] text-center shadow-sm space-y-5">
            {/* Thank You Header */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-2xl font-normal text-[#231610] font-serif-luxury tracking-wide flex items-center justify-center gap-2">
                <span>Thank you for being part of our story.</span>
                <span className="text-[#BA7442] not-italic">❤️</span>
              </h3>
            </div>

            {/* Insha Collections Monogram / Brand Statement */}
            <div className="pt-2 border-t border-[#EAE2D8] space-y-3">
              <h4 className="text-sm sm:text-base font-bold text-[#231610] tracking-[0.24em] uppercase font-serif-luxury">
                INSHA COLLECTIONS
              </h4>
              <p className="text-xs sm:text-sm text-[#5A4D45] font-serif italic max-w-md mx-auto leading-relaxed">
                Started with a simple idea. Built with trust. Growing with you.
              </p>

              {/* Journey Path */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-white/80 border border-[#D5C2AF] text-[11px] sm:text-xs font-semibold tracking-wider text-[#BA7442] uppercase font-sans shadow-2xs">
                <span>RV Nagar</span>
                <span className="text-[#A57D4E]">→</span>
                <span>YV Street, Kadapa Bazaar</span>
                <span className="text-[#A57D4E]">→</span>
                <span>Online</span>
              </div>

              <p className="text-xs text-[#7A6F68] font-sans tracking-wide pt-1">
                And this is only the beginning.
              </p>
            </div>

            {/* Explore Button */}
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-[#231610] hover:bg-[#BA7442] text-white text-xs font-semibold tracking-[0.18em] uppercase font-sans transition-all duration-300 shadow-sm cursor-pointer group"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Explore Collections</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

      </div>

      <FeatureBar />
      <Footer />
    </main>
  );
}
