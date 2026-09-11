"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  startConversation,
  Conversation,
  ChatMessage,
} from "@/services/api";
import {
  Send,
  Lock,
  ShieldCheck,
  ChevronRight,
  Car,
  MessageSquare,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Wrench,
  CheckCheck,
} from "lucide-react";

export default function BuyerMessagesPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const params = useParams();
  const router = useRouter();
  const targetId = params?.id as string | undefined;

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

  // Auto-scroll messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Load Conversations List & Handle Target ID from URL
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function loadAllConversations() {
      setIsLoadingConvs(true);
      try {
        let list = await fetchConversations();
        if (!isMounted) return;

        // If targetId is provided (e.g. from /buyer/messages/[id])
        if (targetId) {
          const matched = list.find((c) => c.id === targetId || c.vehicleId === targetId);
          if (matched) {
            setActiveConv(matched);
          } else {
            // It's a vehicle ID: initiate or retrieve conversation
            try {
              const conv = await startConversation(targetId);
              if (isMounted) {
                setActiveConv(conv);
                list = await fetchConversations();
              }
            } catch (err) {
              console.warn("Could not start conversation for vehicle:", err);
            }
          }
        }

        if (isMounted) {
          setConversations(list);
          if (list.length > 0) {
            setActiveConv((prev) => prev || list[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load conversations:", err);
      } finally {
        if (isMounted) setIsLoadingConvs(false);
      }
    }

    loadAllConversations();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, targetId]);

  // 2. Load Messages for Active Conversation
  useEffect(() => {
    if (!activeConvId) return;
    const currentId = activeConvId;

    let isMounted = true;

    async function loadThreadMessages() {
      setIsLoadingMsgs(true);
      try {
        const msgs = await fetchMessages(currentId);
        if (!isMounted) return;
        setMessages(msgs);
      } catch (err) {
        console.warn("Failed to fetch messages for conversation:", err);
      } finally {
        if (isMounted) setIsLoadingMsgs(false);
      }
    }

    loadThreadMessages();

    return () => {
      isMounted = false;
    };
  }, [activeConvId]);

  // 3. Polling for live updates every 5 seconds when thread is active
  useEffect(() => {
    if (!activeConvId || !isAuthenticated) return;
    const currentId = activeConvId;

    const interval = setInterval(async () => {
      try {
        const msgs = await fetchMessages(currentId);
        setMessages(msgs);
      } catch {
        // Ignore background polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConvId, isAuthenticated, pollTrigger]);

  // Handle Send Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || !activeConv || isSending) return;

    setIsSending(true);
    setInputText("");

    try {
      const newMsg = await sendMessage(activeConv.id, cleanText);
      setMessages((prev) => [...prev, newMsg]);

      // Update active conversation preview in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, lastMessage: cleanText, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
      setPollTrigger((p) => p + 1);
    } catch (err: unknown) {
      console.error("Failed to dispatch message:", err);
      alert("Failed to send message. Please check your connection and try again.");
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
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link href="/buyer/search" className="hover:text-blue-600 transition">
            Marketplace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-semibold">Messages & Protected Inquiries</span>
          {activeConv && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-blue-600 truncate max-w-[200px]">{activeConv.vehicleTitle}</span>
            </>
          )}
        </div>

        {!isAuthenticated ? (
          /* Unauthenticated State */
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-xs my-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Sign in to Access Direct Messaging</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-2 mb-6 leading-relaxed">
              Carplug protects all conversations with end-to-end masked contact routing, verified fraud detection, and direct technician dispatch integrations.
            </p>
            <button
              onClick={() => openAuthModal("login")}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl transition shadow-xs"
            >
              Sign In to Start Chat
            </button>
          </div>
        ) : (
          /* Messaging Shell (Master-Detail) */
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[600px] max-h-[750px]">
            {/* Left Sidebar: Conversations List */}
            <div
              className={`md:col-span-4 border-r border-gray-200 flex flex-col bg-gray-50/50 ${
                activeConv ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div>
                  <h2 className="font-bold text-sm text-neutral-900">Inquiries & Threads</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {conversations.length} active vehicle conversation(s)
                  </p>
                </div>
                <div className="p-1.5 rounded-xl bg-gray-100 text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {isLoadingConvs ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
                    <span className="text-xs">Loading conversations...</span>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-2">
                    <Car className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-xs font-semibold text-gray-600">No active conversations</p>
                    <p className="text-[11px] text-gray-400">
                      Find a car on the marketplace and click &apos;Contact Seller&apos; to start an inquiry.
                    </p>
                    <Link
                      href="/buyer/search"
                      className="inline-block mt-3 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                    >
                      Browse Cars
                    </Link>
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
                          router.push(`/buyer/messages/${conv.id}`);
                        }}
                        className={`w-full p-3.5 text-left transition flex items-start gap-3 ${
                          isSelected
                            ? "bg-blue-50/60 border-l-4 border-blue-600"
                            : "hover:bg-gray-100/70"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 relative border border-gray-200">
                          {conv.vehicleImage ? (
                            <Image
                              src={conv.vehicleImage}
                              alt={conv.vehicleTitle}
                              fill
                              unoptimized
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Car className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-bold text-xs text-neutral-900 truncate">
                              {conv.sellerName || "Verified Seller"}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatTimestamp(conv.lastMessageAt || conv.updatedAt)}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-gray-700 truncate">
                            {conv.vehicleTitle}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {conv.lastMessage || "Conversation started..."}
                          </p>
                        </div>

                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Main Pane: Active Chat Thread */}
            <div
              className={`md:col-span-8 flex flex-col bg-white ${
                !activeConv ? "hidden md:flex items-center justify-center text-gray-400" : "flex"
              }`}
            >
              {activeConv ? (
                <>
                  {/* Top Bar with Scoped Vehicle Info */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Mobile back button */}
                      <button
                        onClick={() => setActiveConv(null)}
                        className="md:hidden p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                        title="Back to conversation list"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <div className="w-11 h-11 rounded-xl bg-gray-200 overflow-hidden shrink-0 border border-gray-200 relative">
                        {activeConv.vehicleImage ? (
                          <Image
                            src={activeConv.vehicleImage}
                            alt={activeConv.vehicleTitle}
                            fill
                            unoptimized
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Car className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-neutral-900 truncate">
                            {activeConv.sellerName}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                            Seller
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Listing: <b className="text-neutral-900">{activeConv.vehicleTitle}</b> • ₦
                          {(activeConv.vehiclePrice / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-[11px] text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium shadow-2xs">
                        <Lock className="w-3 h-3 text-blue-600" />
                        <span>Masked Identity Protection</span>
                      </span>
                      <Link
                        href={`/buyer/vehicles/${activeConv.vehicleId}`}
                        className="p-1.5 text-gray-500 hover:text-neutral-900 border border-gray-200 bg-white rounded-xl transition shadow-2xs"
                        title="View Original Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/buyer/inspections/book/${activeConv.vehicleId}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 bg-blue-50/50 rounded-xl transition shadow-2xs"
                        title="Book Inspection"
                      >
                        <Wrench className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAFBFD]">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-center text-xs text-blue-800 max-w-lg mx-auto leading-relaxed shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <span>
                        <b>Safety First:</b> Never wire money, make advance deposits, or meet in secluded locations. Always request an independent certified Carplug inspection before payment.
                      </span>
                    </div>

                    {isLoadingMsgs ? (
                      <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
                        <span className="text-xs">Loading thread history...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 text-xs">
                        No messages exchanged yet. Send a greeting or ask about vehicle inspection availability!
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.senderId === user?.id || m.senderRole === "buyer";
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <span className="text-[10px] text-gray-400 mb-1 px-1">
                              {m.senderName} • {m.senderRole}
                            </span>
                            <div
                              className={`max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
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

                  {/* Send Input */}
                  <form
                    onSubmit={handleSend}
                    className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type your message or viewing schedule request..."
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
                          <span>Send</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-semibold text-gray-600">
                    Select a conversation from the left to view messages
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
