"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Lock, ShieldCheck } from "lucide-react";

export default function SellerMessagesPage() {
  const [messages, setMessages] = useState([
    { sender: "buyer", text: "Hello! Is this Corolla still available for inspection?", time: "11:00 AM" },
    { sender: "seller", text: "Yes it is. It has clean original factory paint (first body) and valid roadworthiness.", time: "11:04 AM" },
    { sender: "buyer", text: "Great. Can I book a technician inspection via Verza for tomorrow?", time: "11:10 AM" },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages([...messages, { sender: "seller", text: inputText, time: "Just now" }]);
    setInputText("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[600px]">
      <div className="p-4 sm:px-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-sm">
            B
          </div>
          <div>
            <div className="font-bold text-sm text-neutral-900">Buyer Lead #892</div>
            <div className="text-xs text-gray-500">Inquiring on: 2018 Toyota Corolla LE</div>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-500 text-xs font-medium flex items-center gap-1">
          <Lock className="w-3 h-3 text-blue-600" />
          <span>Masked Chat</span>
        </span>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === "seller" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === "seller"
                  ? "bg-neutral-900 text-white rounded-br-xs"
                  : "bg-gray-100 text-neutral-900 rounded-bl-xs"
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`block text-[10px] mt-1 ${
                  m.sender === "seller" ? "text-gray-400 text-right" : "text-gray-500"
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-200 flex items-center gap-2 bg-white"
      >
        <input
          type="text"
          placeholder="Reply to buyer inquiry..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
