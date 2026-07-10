"use client";

import { ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import { SideBar } from "./side-bar";
import { ChatWindow } from "./chat-window";
import { setTheme } from "../lib/store/themestore/theme-slice";
import { closeStatusPreview, setThemeDialog } from "../lib/store/layout/ui-slice";
import { div } from "framer-motion/client";



interface LayoutProps {
  children: ReactNode;
  isThemeDialogOpen?: boolean;
  toggleThemedialog?: () => void;
}

const Layout = ({
  children,
  isThemeDialogOpen: propThemeDialogOpen,
  toggleThemedialog,
}: LayoutProps) => {

  const {
    isThemeDialogOpen,
  } = useAppSelector((state) => state.layout);
  const dispatch = useAppDispatch();

  const {
    selectedUser,
   
    isStatusPreviewOpen,
    statusPreviewContent,
  } = useAppSelector((state) => state.layout);

  const { theme } = useAppSelector(
    (state) => state.theme
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const showChatList = !selectedUser || !isMobile;
  const showChatWindow = !!selectedUser || !isMobile;

  const themeClasses =
    theme === "dark"
      ? "bg-[#111b21] text-white"
      : "bg-gray-100 text-black";

  return (
    <div
      className={`min-h-screen flex relative overflow-hidden ${themeClasses}`}
    >
      {/* Desktop Sidebar */}
      {!isMobile && <SideBar />}

      {/* Main Content */}
      <div
        className={`flex-1 flex overflow-hidden ${
          isMobile ? "flex-col" : ""
        }`}
      >
        <AnimatePresence initial={false} mode="wait">
          {/* Chat List */}
          {showChatList && (
            <motion.div
              key="chat-list"
              initial={{ x: isMobile ? "-100%" : 0 }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className={`w-full md:w-2/5 h-full ${
                isMobile ? "pb-16" : ""
              }`}
            >
              {children}
            </motion.div>
          )}

          {/* Chat Window */}
          {showChatWindow && (
            <motion.div
              key="chat-window"
              initial={{ x: isMobile ? "100%" : 0 }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25 }}
              className="w-full md:w-3/5 h-full"
            >
              <ChatWindow
                selectedUser={selectedUser ?? ""}
                isMobile={isMobile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <SideBar />}

      {/* Theme Dialog */}
      {isThemeDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
         <div
  className={`w-full max-w-sm rounded-lg p-6 shadow-lg ${
    theme === "dark"
      ? "bg-[#202c33] text-white"
      : "bg-white text-black"
  }`}
>
  <h2 className="mb-6 text-xl font-semibold">
    Choose Theme
  </h2>

  <div className="space-y-4">
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="theme"
        value="light"
        checked={theme === "light"}
        onChange={() => dispatch(setTheme("light"))}
      />
      <span>Light Theme</span>
    </label>

    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="theme"
        value="dark"
        checked={theme === "dark"}
        onChange={() => dispatch(setTheme("dark"))}
      />
      <span>Dark Theme</span>
    </label>
  </div>

  <button
    onClick={() => dispatch(setThemeDialog(false))}
    className="mt-6 w-full rounded-md bg-red-500 p-3 text-white"
  >
    Close
  </button>
</div>
        </div>
      )}
{/* {isStatusPreviewOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
       {statusPreviewContent}
        </div> 
)} */}
{isStatusPreviewOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div
      className={`relative max-w-lg w-full rounded-lg p-6 ${
        theme === "dark"
          ? "bg-[#202c33] text-white"
          : "bg-white text-black"
      }`}
    >
      <button
        onClick={() => dispatch(closeStatusPreview())}
        className="absolute top-3 right-3 text-xl"
      >
        ✕
      </button>

      <h2 className="mb-4 text-lg font-semibold">
        Status Preview
      </h2>

      <div className="rounded-lg border p-4">
        {statusPreviewContent}
      </div>
    </div>
  </div>
)}
       
    </div>
  );
};

export default Layout;