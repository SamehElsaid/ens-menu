"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import ClientNavigationSwiper from "@/components/ClientNavigationSwiper";
import ClientSidebar from "@/components/ClientSidebar";
import Loader from "@/components/Global/Loader";
import { usePathname } from "next/navigation";
import CardDashBoard from "@/components/Card/CardDashBoard";
import {
  FaComments,
  FaPaperPlane,
  FaUser,
  FaUserTie,
  FaTimes,
} from "react-icons/fa";
import CustomInput from "../Custom/CustomInput";

// Define message type
export interface Message {
  id: string;
  sender: "parent" | "specialist";
  content: string;
  timestamp: string;
}

interface LayoutClientProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function LayoutClient({ children, params }: LayoutClientProps) {
  const locale = useLocale();
  const t = useTranslations("");
  const [loading, setLoading] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>("");
  const pathname = usePathname();

  // Messages state
  const popupMessagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isMessagesPopupOpen, setIsMessagesPopupOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1); // Number of unread messages
  const currentUser: "parent" | "specialist" = "specialist"; // This should come from auth context

  // Sample messages - replace with actual API call
  const [messages, setMessages] = useState<Message[]>(() => {
    const now = Date.now();
    return [
      {
        id: "m1",
        sender: "parent",
        content: "الطفل أظهر تحسناً جيداً خلال الجلسة. شكراً لمساعدتك.",
        timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: "m2",
        sender: "specialist",
        content: "رائع أن أسمع ذلك! استمروا في ممارسة التمارين في المنزل.",
        timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
      {
        id: "m3",
        sender: "parent",
        content: "لاحظنا بعض التحسن. هل يمكننا جدولة جلسة إضافية؟",
        timestamp: new Date(now - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
    ];
  });

  useEffect(() => {
    params.then((resolvedParams) => {
      setClientId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, [pathname]);

  // Scroll popup messages to bottom
  useEffect(() => {
    if (isMessagesPopupOpen) {
      popupMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesPopupOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    if (isMessagesPopupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMessagesPopupOpen]);

  // Mark messages as read when popup opens
  const handleOpenMessagesPopup = () => {
    setIsMessagesPopupOpen(true);
    setUnreadCount(0);
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `m${Date.now()}`,
      sender: currentUser,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    // Here you would also send to API
  };

  if (!clientId) {
    return (
      <CardDashBoard className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </CardDashBoard>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <ClientSidebar clientId={clientId} />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ClientNavigationSwiper
            setLoading={setLoading}
            loading={loading}
            clientId={clientId}
          />
          {loading ? (
            <CardDashBoard className="flex justify-center items-center min-h-[400px]">
              <Loader />
            </CardDashBoard>
          ) : (
            children
          )}
        </div>
      </div>

      {/* Messages Popup Modal */}
      {isMessagesPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm m-0">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FaComments className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("overview.messages.title") || "Messages"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("overview.messages.description") ||
                      "Communicate with parent/specialist"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMessagesPopupOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>
                    {t("overview.messages.noMessages") || "No messages yet"}
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.sender === currentUser;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          message.sender === "parent"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {message.sender === "parent" ? (
                          <FaUser className="text-sm" />
                        ) : (
                          <FaUserTie className="text-sm" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`flex flex-col gap-1 max-w-[70%] ${
                          isCurrentUser ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? "bg-primary text-white rounded-tr-none"
                              : message.sender === "parent"
                              ? "bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-none"
                              : "bg-green-50 text-green-900 border border-green-100 rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            {message.sender === "parent"
                              ? t("overview.messages.parent") || "Parent"
                              : t("overview.messages.specialist") ||
                                "Specialist"}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(message.timestamp).toLocaleString(
                              locale === "ar" ? "ar-SA" : "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={popupMessagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <CustomInput
                  type="textarea"
                  className="flex-1"
                  value={newMessage}
                  placeholder={
                    t("overview.messages.placeholder") ||
                    "Type your message here..."
                  }
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0"
                >
                  <FaPaperPlane />
                  <span>{t("overview.messages.send") || "Send"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Messages Button */}
      <button
        onClick={handleOpenMessagesPopup}
        className={`fixed bottom-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center group end-3`}
        aria-label={t("overview.messages.title") || "Messages"}
      >
        <FaComments className="text-xl" />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse end-0`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
