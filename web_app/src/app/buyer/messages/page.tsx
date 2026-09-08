"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrustTierBadge } from "@/components/common/TrustTierBadge";
import { MOCK_VEHICLES } from "@/data/mockStore";
import {
  MessageSquare,
  ShieldCheck,
  Send,
  Phone,
  Calendar,
  Lock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function BuyerMessagesPage() {
  const [messages, setMessages] = useState([
    { sender: "seller", text: "Hello! Thank you for your inquiry on the 2021 Lexus RX 350.", time: "10:30 AM" },
    { sender: "buyer", text: "Hi, I saw the Tier 5 report. Are the lower control arm bushings still okay for highway driving?", time: "10:35 AM" },
    { sender: "seller", text: "Yes, Tech Musa noted hairline wear, but they are 100% fine for the next 15k km. You're welcome to schedule an in-person viewing at our Lekki showroom.", time: "10:42 AM" },
  ]);
  const [inputText, setInputText] = useState("");
  const car = MOCK_VEHICLES[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "buyer", text: inputText, time: "Just now" },
    ]);
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link href="/buyer/search" className="hover:text-blue-600">
            Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Messages</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-neutral-900">{car.title}</span>
        </div>

        {/* Chat Shell */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs flex-1 flex flex-col min-h-[550px]">
          {/* Top Bar with Scoped Vehicle Info */}
          <div className="p-4 sm:px-6 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                <img
                  src={car.images[0]}
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-neutral-900">{car.sellerName}</h3>
                  <TrustTierBadge tier={car.trustTier} size="sm" />
                </div>
                <div className="text-xs text-gray-500">
                  Regarding: <b className="text-neutral-900">{car.title}</b> (₦{(car.price / 1000000).toFixed(1)}M)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-blue-600" />
                <span>Masked Number: +234 803 ••• ••41</span>
              </span>
              <Link
                href={`/buyer/vehicles/${car.id}`}
                className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
              >
                View Listing
              </Link>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center text-xs text-blue-800 max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <span>
                To protect buyers from scams, never pay cash deposits or wire money before an independent technician inspection is completed.
              </span>
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "buyer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    m.sender === "buyer"
                      ? "bg-neutral-900 text-white rounded-br-xs"
                      : "bg-gray-100 text-neutral-900 rounded-bl-xs"
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      m.sender === "buyer" ? "text-gray-400 text-right" : "text-gray-500"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Send Input */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your question or schedule a viewing..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
