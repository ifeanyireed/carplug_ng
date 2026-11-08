"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  getWebSocketUrl,
  getAuthToken,
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
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const targetConvId = searchParams?.get("id") || searchParams?.get("conv");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pollTrigger, setPollTrigger] = useState(0);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeConvId = activeConv?.id;
  const activeConvIdRef = useRef<string | undefined>(activeConvId);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Seller's Inbound Buyer Threads
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    async function loadConversations() {
      setIsLoadingConvs(true);
      try {
        const list = await fetchConversations();
        if (!isMounted) return;
        setConversations(list);
        if (list.length > 0) {
          const target = targetConvId
            ? list.find((c) => c.id === targetConvId || c.vehicleId === targetConvId)
            : null;
          setActiveConv((prev) => target || prev || list[0]);
        }
      } catch (err) {
        console.warn("Failed to load seller conversations:", err);
      } finally {
        if (isMounted) setIsLoadingConvs(false);
      }
    }

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isAuthenticated, targetConvId]);

  // Load Messages for Active Thread
  useEffect(() => {
    if (!activeConvId) return;
    const currentId = activeConvId;

    let isMounted = true;

    async function loadThread() {
      setIsLoadingMsgs(true);
      try {
        const msgs = await fetchMessages(currentId);
        if (!isMounted) return;
        setMessages(msgs);
      } catch (err) {
        console.warn("Failed to load thread:", err);
      } finally {
        if (isMounted) setIsLoadingMsgs(false);
      }
    }

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [activeConvId]);

  // Real-Time Duplex WebSocket Connection
  useEffect(() => {
    if (!isAuthenticated) return;

    let isSubscribed = true;
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;

    function connect() {
      const token = getAuthToken();
      if (!token) return;
      try {
        const url = getWebSocketUrl();
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isSubscribed) {
            setIsWsConnected(true);
            retryCount = 0;
          }
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            const currentActiveId = activeConvIdRef.current;
            if (data.type === "new_message" && data.message) {
              const newMsg: ChatMessage = data.message;
              if (data.conversationId === currentActiveId) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              }
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === data.conversationId
                    ? {
                        ...c,
                        lastMessage: newMsg.body,
                        lastMessageAt: newMsg.createdAt,
                        unreadCount: c.id === currentActiveId ? 0 : (c.unreadCount || 0) + 1,
                      }
                    : c
                )
              );
            } else if (data.type === "user_typing" && data.conversationId === currentActiveId) {
              setTypingUser(data.userName || "Buyer");
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                if (isSubscribed) setTypingUser(null);
              }, 3000);
            }
          } catch {
            // Ignore non-JSON
          }
        };

        ws.onclose = () => {
          if (isSubscribed) {
            setIsWsConnected(false);
            if (retryCount < 5) {
              const delay = Math.min(1000 * Math.pow(2, retryCount), 15000);
              retryCount++;
              reconnectTimeout = setTimeout(connect, delay);
            }
          }
        };

        ws.onerror = () => {
          if (isSubscribed) {
            setIsWsConnected(false);
            ws?.close();
          }
        };
      } catch {
        if (isSubscribed && retryCount < 5) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 15000);
          retryCount++;
          reconnectTimeout = setTimeout(connect, delay);
        }
      }
    }

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id]);

  // Background Polling Fallback (Relaxed to 15s)
  useEffect(() => {
    if (!activeConvId || !isAuthenticated) return;
    const currentId = activeConvId;

    const interval = setInterval(async () => {
      try {
        const msgs = await fetchMessages(currentId);
        setMessages((prev) => (msgs.length >= prev.length ? msgs : prev));
      } catch {
        // Ignore background polling errors
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeConvId, isAuthenticated, pollTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeConv) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: "typing",
            conversationId: activeConv.id,
          })
        );
      } catch {
        // Non-blocking socket write
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || !activeConv || isSending) return;

    setIsSending(true);
    setInputText("");

    try {
      const msg = await sendMessage(activeConv.id, clean);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
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
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[650px] max-h-[750px]">
      {/* Left List Pane */}
      <div className="md:col-span-4 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-neutral-900">Inbound Buyer Inquiries</h2>
              {isWsConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {conversations.length} leads in direct chat
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
            title="Refresh Leads"
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
              <p className="text-xs font-semibold text-gray-600">No buyer messages yet</p>
              <p className="text-[11px] text-gray-400">
                Inquiries will arrive here automatically when buyers click &apos;Contact Seller&apos; on your listings.
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
                    setConversations((prev) =>
                      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                    );
                  }}
                  className={`w-full p-3.5 text-left transition flex items-start gap-3 ${
                    isSelected
                      ? "bg-neutral-900 text-white"
                      : "hover:bg-gray-100/70 text-neutral-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {conv.buyerName?.charAt(0) || "B"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs truncate">
                        {conv.buyerName || "Verified Buyer"}
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
                      Car: {conv.vehicleTitle}
                    </p>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {conv.lastMessage || "Inquiry received..."}
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

      {/* Right Chat Pane */}
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
                      Buyer Lead
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Regarding: <b className="text-neutral-900">{activeConv.vehicleTitle}</b> (₦
                    {(activeConv.vehiclePrice / 1000000).toFixed(1)}M)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-500 text-xs font-medium flex items-center gap-1 shadow-2xs">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>Masked Lead Chat</span>
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

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFBFD]">
              {isLoadingMsgs ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
                  <span className="text-xs">Loading message thread...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No message history with this buyer yet.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe =
                    m.senderId === user?.id ||
                    m.senderRole === "dealer" ||
                    m.senderRole === "seller";
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

              {typingUser && (
                <div className="flex items-center gap-2 text-[11px] text-gray-500 italic px-2 py-1 bg-gray-100/70 rounded-full w-fit animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  <span>{typingUser} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Send Box */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your response to the buyer..."
                value={inputText}
                onChange={handleInputChange}
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
              Select an inquiry on the left to review customer messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
