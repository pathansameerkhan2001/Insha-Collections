"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureBar from "@/components/FeatureBar";
import { MapPin, Phone, Clock, Navigation, ArrowLeft, Store } from "lucide-react";

const STORES = [
  {
    id: "kadapa-store",
    name: "Kadapa Main Boutique",
    tag: "OFFICIAL STORE",
    address: "Room no 6, Rachuru complex, Y V Street, Kadapa, Andhra Pradesh 516001",
    phone: "+91 9618648050",
    hours: "Mon – Sat: 10:00 AM – 8:00 PM",
    services: [
      "Anti-Tarnish Jewellery Showcase",
      "Korean Accessories Studio",
      "Bridal & Dress Materials Consultation",
      "Beauty & Salon Services",
    ],
    mapUrl: "https://maps.google.com/?q=Rachuru+complex+Y+V+Street+Kadapa+516001",
  },
];

export default function StoreLocatorPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F3]">
      <Header />

      {/* Hero Banner */}
      <section className="relative w-full py-14 sm:py-20 bg-[#F5ECE5] border-b border-[#EAE2D8] overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A57D4E] uppercase hover:text-[#231610] mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3">
            <div className="h-[1px] w-12 bg-[#C5A47E]" />
            <span className="text-[#C5A47E] text-xs font-semibold tracking-[0.25em] uppercase">
              VISIT OUR BOUTIQUES
            </span>
            <div className="h-[1px] w-12 bg-[#C5A47E]" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#231610] font-serif-luxury tracking-wider uppercase leading-tight">
            STORE LOCATOR
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#7A6F68] font-cormorant italic mt-2">
            Experience the luxury of Insha Collections in person at our flagship boutiques
          </p>
        </div>
      </section>

      {/* Store Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {STORES.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-[#EAE2D8] shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#C5A47E]/60 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md bg-[#6A1A24] text-white">
                    {store.tag}
                  </span>
                  <Store className="w-5 h-5 text-[#BA7442]" />
                </div>

                <h2 className="text-lg sm:text-xl font-normal text-[#231610] font-serif-luxury uppercase tracking-wide">
                  {store.name}
                </h2>

                <div className="space-y-3.5 mt-5 text-xs sm:text-sm text-[#5A4D45]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#BA7442] flex-shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                    <a
                      href={`tel:${store.phone.replace(/\s+/g, "")}`}
                      className="text-[#231610] hover:text-[#BA7442] font-medium transition-colors"
                    >
                      {store.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                </div>

                {/* Boutique Services */}
                <div className="mt-5 pt-4 border-t border-[#F2ECE4]">
                  <span className="text-[11px] font-semibold text-[#8C7E75] uppercase tracking-wider block mb-2">
                    Available In-Store:
                  </span>
                  <div className="space-y-1.5">
                    {store.services.map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#7A6F68]">
                        <span className="w-1 h-1 rounded-full bg-[#C5A47E]" />
                        <span>{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#F2ECE4]">
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-lg bg-[#231610] hover:bg-[#BA7442] text-[#FAF7F3] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${store.phone.replace(/\s+/g, "")}`}
                  className="px-4 py-2.5 rounded-lg border border-[#C5A47E] bg-[#FAF7F3] hover:bg-[#FAF0E4] text-[#231610] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#BA7442]" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FeatureBar />
      <Footer />
    </main>
  );
}
