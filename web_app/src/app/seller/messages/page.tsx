"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  Conversation,
  ChatMessage,
} from "@/services/api";
import {
  Send,
  Lock,
  Car,
  MessageSquare,
  Loader2,
  ExternalLink,
  CheckCheck,
  RefreshCw,
} from "lucide-react";

export default function SellerMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(false);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pollTrigger, setPollTrigger] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvId = activeConv?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Seller's Inbound Buyer Threads
  useEffect(() => {
    let isMounted = true;

    async function loadConversations() {
      try {
        const list = await fetchConversations();
        if (!isMounted) return;
        setConversations(list);
        if (list.length > 0) {
          setActiveConv((prev) => prev || list[0]);
        }
      } catch (err) {
        console.warn("Failed to load seller conversations:", err);
      }
    }

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load Messages for Active Thread
  useEffect(() => {
    if (!activeConvId) return;
    const currentId = activeConvId;

    let isMounted = true;

    async function loadThread() {
      try {
        const msgs = await fetchMessages(currentId);
        if (!isMounted) return;
        setMessages(msgs);
      } catch (err) {
        console.warn("Failed to load thread:", err);
      }
    }

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [activeConvId]);

  // Background Polling for New Inbound Buyer Messages
  useEffect(() => {
    if (!activeConvId) return;
    const currentId = activeConvId;

    const interval = setInterval(async () => {
      try {
        const msgs = await fetchMessages(currentId);
        setMessages(msgs);
      } catch {
        // Ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConvId, pollTrigger]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || !activeConv || isSending) return;

    setIsSending(true);
    setInputText("");

    try {
      const msg = await sendMessage(activeConv.id, clean);
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, lastMessage: clean, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
      setPollTrigger((p) => p + 1);
    } catch (err: unknown) {
      console.error("Failed to send reply:", err);
      alert("Failed to send reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[600px] max-h-[720px]">
      {/* Left Inquiries List */}
      <div className="md:col-span-4 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-neutral-900">Buyer Inquiries</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {conversations.length} prospective buyers
            </p>
          </div>
          <button
            onClick={async () => {
              setIsLoadingConvs(true);
              const list = await fetchConversations();
              setConversations(list);
              setIsLoadingConvs(false);
            }}
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingConvs ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {isLoadingConvs ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
              <span className="text-xs">Loading buyer inquiries...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-semibold text-gray-600">No buyer inquiries yet</p>
              <p className="text-[11px] text-gray-400">
                When buyers view your cars and click &apos;Contact Seller&apos;, inquiries will appear here.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConv(conv);
                    setMessages([]);
                  }}
                  className={`w-full p-3.5 text-left transition flex items-start gap-3 ${
                    isSelected
                      ? "bg-neutral-900 text-white"
                      : "hover:bg-gray-100/70 text-neutral-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {conv.buyerName?.charAt(0) || "B"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs truncate">
                        {conv.buyerName || "Prospective Buyer"}
                      </span>
                      <span
                        className={`text-[10px] shrink-0 ${
                          isSelected ? "text-gray-300" : "text-gray-400"
                        }`}
                      >
                        {formatTimestamp(conv.lastMessageAt || conv.updatedAt)}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] truncate ${
                        isSelected ? "text-gray-200" : "text-gray-600"
                      }`}
                    >
                      Listing: {conv.vehicleTitle}
                    </p>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {conv.lastMessage || "Inquiry started..."}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Thread */}
      <div className="md:col-span-8 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 sm:px-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {activeConv.buyerName?.charAt(0) || "B"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">
                      {activeConv.buyerName}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                      Interested Buyer
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Listing: <b className="text-neutral-900">{activeConv.vehicleTitle}</b> (₦
                    {(activeConv.vehiclePrice / 1000000).toFixed(1)}M)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-500 text-xs font-medium flex items-center gap-1 shadow-2xs">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>Masked Contact</span>
                </span>
                <Link
                  href={`/buyer/vehicles/${activeConv.vehicleId}`}
                  target="_blank"
                  className="p-1.5 text-gray-500 hover:text-neutral-900 border border-gray-200 bg-white rounded-lg transition shadow-2xs"
                  title="View Public Listing"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFBFD]">
              {isLoadingMsgs ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
                  <span className="text-xs">Loading message thread...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No messages yet from this buyer.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id || m.senderRole === "seller";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] text-gray-400 mb-1 px-1">
                        {m.senderName} • {m.senderRole}
                      </span>
                      <div
                        className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? "bg-neutral-900 text-white rounded-br-xs"
                            : "bg-white border border-gray-200 text-neutral-900 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                            isMe ? "text-gray-400" : "text-gray-400"
                          }`}
                        >
                          <span>{formatTimestamp(m.createdAt)}</span>
                          {isMe && (
                            <CheckCheck
                              className={`w-3 h-3 ${m.readAt ? "text-blue-400" : "text-gray-500"}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Form */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Reply to buyer..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-xs"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
            <Car className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">
              Select an inquiry on the left to read buyer messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
