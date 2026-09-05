"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Cloud,
  MessageSquare,
  Store,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [cognitoConfigured, setCognitoConfigured] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setCognitoConfigured(Boolean(data.cognitoMode));
      } catch (err) {
        console.error("Status check error:", err);
      }
    }
    checkStatus();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-[#EAE2D8]">
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#231610] tracking-tight">
          Admin Settings & Integrations
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6F68] mt-1">
          Store configuration, cloud services status, and environment variables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Store Information Card */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EAE2D8]/60">
            <div className="w-9 h-9 rounded-xl bg-[#B89366]/15 text-[#B89366] flex items-center justify-center">
              <Store className="w-5 h-5 stroke-[1.6]" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                Store Profile
              </h3>
              <p className="text-[11px] text-[#7A6F68]">Primary business details</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#8C7E75] block uppercase text-[10px] font-semibold">Store Brand</span>
              <span className="font-semibold text-[#231610] text-sm">Insha Collections</span>
            </div>
            <div>
              <span className="text-[#8C7E75] block uppercase text-[10px] font-semibold">Orders Reception WhatsApp</span>
              <span className="font-mono text-[#231610] font-medium">+91 9618648050</span>
            </div>
            <div>
              <span className="text-[#8C7E75] block uppercase text-[10px] font-semibold">Store Location</span>
              <span className="text-[#231610]">Opp. Minar Function Hall, Chilkalguda, Secunderabad, Telangana 500061</span>
            </div>
          </div>
        </div>

        {/* 2. WhatsApp Cloud API Status */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2D5A27]/15 text-[#2D5A27] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 stroke-[1.6]" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                  WhatsApp Cloud API
                </h3>
                <p className="text-[11px] text-[#7A6F68]">Automated checkout dispatch</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#2D5A27]/15 text-[#2D5A27] font-semibold px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#7A6F68]">
            <p>
              When customers complete the checkout modal, order payload is dispatched directly via Meta WhatsApp Cloud API with product photo and delivery address.
            </p>
            <div className="p-3 bg-[#FAF7F3] rounded-xl border border-[#EAE2D8] font-mono text-[11px] text-[#231610]">
              Mode: Auto (Template + Session fallback)
            </div>
          </div>
        </div>

        {/* 3. AWS S3 Image Storage Card */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#BA7442]/15 text-[#BA7442] flex items-center justify-center">
                <Cloud className="w-5 h-5 stroke-[1.6]" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                  AWS S3 Image Storage
                </h3>
                <p className="text-[11px] text-[#7A6F68]">Secure server-side uploads</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#FAF7F3] border border-[#D8CEBE] text-[#7A6F68] font-semibold px-2 py-0.5 rounded-full">
              S3 BUCKET SET
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#7A6F68]">
            <p>
              Product image uploads are structured with unique keys:
              <br />
              <code className="text-[#9C5A2C] font-mono text-[11px]">
                products/&#123;category&#125;/&#123;productId&#125;/&#123;timestamp&#125;-&#123;file&#125;.webp
              </code>
            </p>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-semibold text-[#8C7E75] block mb-1">
                Configured S3 Settings:
              </span>
              <div className="p-3 bg-[#1F140E] text-[#FAF7F3] rounded-xl font-mono text-[11px] space-y-0.5">
                <div>AWS_REGION=ap-southeast-2</div>
                <div>AWS_S3_BUCKET_NAME=insha-collection-assets</div>
                <div>AWS_ACCESS_KEY_ID=••••••••••••••••</div>
                <div>AWS_SECRET_ACCESS_KEY=••••••••••••••••</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. AWS Cognito Auth Card */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6A1A24]/10 text-[#6A1A24] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[1.6]" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                  AWS Cognito Authentication
                </h3>
                <p className="text-[11px] text-[#7A6F68]">Enterprise Admin User Pool</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#FAF7F3] border border-[#D8CEBE] text-[#7A6F68] font-semibold px-2 py-0.5 rounded-full">
              {cognitoConfigured ? "COGNITO CONNECTED" : "DEV SESSION READY"}
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#7A6F68]">
            <p>
              Connected to Insha Collections admin user pool in Sydney (ap-southeast-2). Direct username/password authentication is verified via AWS Cognito Identity Provider.
            </p>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-semibold text-[#8C7E75] block mb-1">
                Configured Cognito Pool:
              </span>
              <div className="p-3 bg-[#1F140E] text-[#FAF7F3] rounded-xl font-mono text-[11px] space-y-0.5">
                <div>AWS_COGNITO_REGION=ap-southeast-2</div>
                <div>AWS_COGNITO_USER_POOL_ID=ap-southeast-2_BAyDRrryV</div>
                <div>AWS_COGNITO_CLIENT_ID=1o4lmii74fafsmui9rnpu6em2v</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
