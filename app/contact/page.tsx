"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureBar from "@/components/FeatureBar";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
    }, 4000);
  };

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
              WE ARE HERE FOR YOU
            </span>
            <div className="h-[1px] w-12 bg-[#C5A47E]" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#231610] font-serif-luxury tracking-wider uppercase leading-tight">
            CONTACT INSHA COLLECTIONS
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#7A6F68] font-cormorant italic mt-2">
            Connect with our concierge, bridal styling team, or salon booking support
          </p>
        </div>
      </section>

      {/* Main Grid: Contact Form + Info Details */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE2D8] shadow-sm space-y-6">
              <h2 className="text-lg sm:text-xl font-normal text-[#231610] font-serif-luxury tracking-wider uppercase border-b border-[#F2ECE4] pb-4">
                Get In Touch
              </h2>

              <div className="space-y-5 text-sm text-[#3D312A]">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8C7E75] uppercase tracking-wider block">
                      Call / WhatsApp
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <a
                        href="tel:+919618648050"
                        className="text-[#231610] hover:text-[#BA7442] font-medium transition-colors"
                      >
                        +91 9618648050
                      </a>
                      <a
                        href="tel:+919000407681"
                        className="text-[#231610] hover:text-[#BA7442] font-medium transition-colors"
                      >
                        +91 9000407681
                      </a>
                    </div>
                    <p className="text-xs text-[#7A6F68] mt-0.5">Direct concierge assistance</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8C7E75] uppercase tracking-wider block">
                      Business Hours
                    </span>
                    <p className="text-[#231610] font-medium">Monday – Saturday</p>
                    <p className="text-xs text-[#7A6F68]">10:00 AM – 8:00 PM IST</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8C7E75] uppercase tracking-wider block">
                      Physical Store
                    </span>
                    <p className="text-[#231610] font-medium">
                      Room no 6, Rachuru complex, Y V Street, Kadapa 516001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#EAE2D8] shadow-sm">
              <h2 className="text-lg sm:text-xl font-normal text-[#231610] font-serif-luxury tracking-wider uppercase mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-[#7A6F68] mb-6">
                Have a question regarding an order, bridal makeover booking, or custom dress material? Fill out the form below.
              </p>

              {isSubmitted ? (
                <div className="bg-[#FAF0E4] border border-[#C5A47E] rounded-xl p-8 text-center space-y-3 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-12 h-12 text-[#BA7442] mx-auto" />
                  <h3 className="text-base sm:text-lg font-semibold text-[#231610] uppercase tracking-wider">
                    Message Received
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A4D45] max-w-sm mx-auto">
                    Thank you for reaching out to Insha Collections. Our styling concierge will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#D5C2AF] text-xs sm:text-sm text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#D5C2AF] text-xs sm:text-sm text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#D5C2AF] text-xs sm:text-sm text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#D5C2AF] text-xs sm:text-sm text-[#231610] bg-white focus:outline-none focus:border-[#BA7442]"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Jewellery Customization">Jewellery Customization</option>
                        <option value="Beauty & Salon Booking">Beauty & Salon Booking</option>
                        <option value="Order & Tracking Support">Order & Tracking Support</option>
                        <option value="Bulk / Wedding Gifting">Bulk / Wedding Gifting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How may we assist you today?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#D5C2AF] text-xs sm:text-sm text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#BA7442] to-[#9C5A2C] hover:from-[#A86435] hover:to-[#8B4E24] text-white text-xs font-semibold tracking-[0.16em] uppercase font-sans transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <FeatureBar />
      <Footer />
    </main>
  );
}
