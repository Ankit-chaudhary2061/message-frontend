"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaPlus, FaSearch } from "react-icons/fa";

import { IUser } from "../lib/store/auth/auth-slice-types";
import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import formatTimestamp from "../lib/utiil/fromat-time";
import { getMessages, setSelectedConversation, setSelectedUser } from "../lib/store/chat/chat-slice";

interface ChatListProps {
  contacts?: IUser[];
  selectedContactId?: string | null;
  onSelect?: (id: string) => void;
}

export const ChatList = ({
  contacts = [],
  selectedContactId,
  onSelect,
}: ChatListProps) => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);

  const [searchTerms, setSearchTerms] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.username
      ?.toLowerCase()
      .includes(searchTerms.toLowerCase())
  );
const handleSelect = (id: string) => {
  console.log("Clicked contact id:", id);

  const contact = contacts.find((c) => c._id === id);

  console.log("Found contact:", contact);

  if (!contact) return;

  dispatch(setSelectedUser(contact));
  console.log("Dispatched selected user");

  if (contact.conversation) {
    dispatch(setSelectedConversation(contact.conversation as any));
    dispatch(getMessages(contact.conversation._id));
    console.log("Conversation selected:", contact.conversation._id);
  }
};
  return (
    <div
      className={`w-full h-screen border-r ${
        theme === "dark"
          ? "bg-[rgb(17,27,33)] border-gray-600"
          : "bg-white border-gray-200"
      }`}
    >
      {/* ================= HEADER ================= */}
      <div
        className={`p-4 flex items-center justify-between ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        <h2 className="text-xl font-semibold">Chats</h2>

        <button className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
          <FaPlus />
        </button>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="p-2">
        <div className="relative">
          <FaSearch
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === "dark"
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          />

          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerms}
            onChange={(e) =>
              setSearchTerms(e.target.value)
            }
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-700 placeholder-gray-500"
                : "bg-gray-100 text-black border-gray-200 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {/* ================= CONTACTS ================= */}
      <div className="overflow-y-auto h-[calc(100vh-120px)]">
        {filteredContacts.length === 0 ? (
          <div
            className={`p-4 text-center ${
              theme === "dark"
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            No contacts found
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const conversation = contact.conversation;
            const lastMessage =
              conversation?.lastMessage;

            const showUnreadBadge =
              conversation &&
              conversation.unreadCounts > 0 &&
              lastMessage?.receiver === user?._id;

            return (
             <motion.div
  key={contact._id}
  whileHover={{ scale: 1.01 }}
  whileTap={{ scale: 0.98 }}
onClick={() => contact._id && handleSelect(contact._id)}
  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200
    ${
      selectedContactId === contact._id
        ? "bg-green-100 dark:bg-green-900/30"
        : theme === "dark"
        ? "hover:bg-gray-800"
        : "hover:bg-gray-100"
    }
  `}
>
  {/* Avatar */}
  <div className="relative shrink-0">
    <Image
      src={contact.profileImage?.url || "/default-avatar.png"}
      alt={contact.username || "Contact"}
      width={56}
      height={56}
      className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-700"
    />

    {/* Online Indicator (optional) */}
    {/* {contact.isOnline && (
      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
    )} */}
  </div>

  {/* Right Content */}
  <div className="flex-1 min-w-0">
    {/* Top */}
    <div className="flex items-center justify-between">
      <h3
        className={`font-semibold text-[16px] truncate ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        {contact.username}
      </h3>

      {lastMessage && (
        <span
          className={`text-xs whitespace-nowrap ml-2 ${
            theme === "dark"
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          {formatTimestamp(lastMessage.createdAt)}
        </span>
      )}
    </div>

    {/* Bottom */}
    <div className="flex items-center justify-between mt-1">
      <p
        className={`text-sm truncate pr-2 ${
          theme === "dark"
            ? "text-gray-400"
            : "text-gray-500"
        }`}
      >
        {lastMessage?.content || "Start a conversation"}
      </p>

      {showUnreadBadge && (
        <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-green-500 text-white text-[11px] font-semibold">
          {conversation.unreadCounts}
        </span>
      )}
    </div>
  </div>
</motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};