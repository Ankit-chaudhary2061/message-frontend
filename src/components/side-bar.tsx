"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  useAppDispatch,
  useAppSelector,
} from "../lib/store/hook";

import { setActiveTab } from "../lib/store/layout/ui-slice";
import { FaUserCircle, FaWhatsapp ,FaCog} from "react-icons/fa";
import { MdRadioButtonChecked } from "react-icons/md";
import { motion } from "framer-motion";

export const SideBar = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { theme } = useAppSelector(
    (state) => state.theme
  );

  const { user } = useAppSelector(
    (state) => state.auth
  );
console.log(user)
  const { activeTab, selectedContactId } =
    useAppSelector((state) => state.layout);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  useEffect(() => {
    if (pathname === "/home") {
      dispatch(setActiveTab("chats"));
    } else if (pathname === "/status") {
      dispatch(setActiveTab("status"));
    } else if (pathname === "/user-profile") {
      dispatch(setActiveTab("profile"));
    }else if (pathname === "/setting") {
      dispatch(setActiveTab("setting"));
    }
  }, [pathname, dispatch]);
if(isMobile && selectedContactId){
    return null;
}
const iconClass =
  activeTab === "chats"
    ? theme === "dark"
      ? "text-gray-800"
      : "text-green-600"
    : theme === "dark"
    ? "text-gray-300"
    : "text-gray-800";
const SideBarContent = (
  <>
    <Link
      href="/home"
      className={`${!isMobile ? "mb-8" : ""}
      ${
        activeTab === "chats"
          ? "bg-gray-300 shadow-sm p-2 rounded-full"
          : ""
      }
      focus:outline-none`}
    >
      <FaWhatsapp className={`h-6 w-6 ${iconClass}`} />
    </Link>

    <Link
      href="/status"
      className={`${!isMobile ? "mb-8" : ""}
      ${
        activeTab === "status"
          ? "bg-gray-300 shadow-sm p-2 rounded-full"
          : ""
      }
      focus:outline-none`}
    >
      <MdRadioButtonChecked className={`h-6 w-6 ${iconClass}`} />
    </Link>

    {!isMobile && <div className="grow" />}
  <Link
  href="/user-profile"
  className={`${!isMobile ? "mb-8" : ""}
    ${
      activeTab === "profile"
        ? "bg-gray-300 shadow-sm p-2 rounded-full"
        : ""
    }
    focus:outline-none`}
>
  {user?.profileImage?.url ? (
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
      <Image
        src={user.profileImage.url}
        alt="Profile"
        width={40}
        height={40}
        className="w-full h-full object-cover"
      />
    </div>
  ) : (
    <FaUserCircle className={`h-10 w-10 ${iconClass}`} />
  )}
</Link>
    <Link
      href="/setting"
      className={`${!isMobile ? "mb-8" : ""}
      ${
        activeTab === "setting"
          ? "bg-gray-300 shadow-sm p-2 rounded-full"
          : ""
      }
      focus:outline-none`}
    >
      <FaCog className={`h-6 w-6 ${iconClass}`} />
    </Link>

  </>
);
  return (
    <>
    <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
  className={`
    ${
      isMobile
        ? "fixed bottom-0 left-0 right-0 h-16"
        : "w-16 h-screen border-r-2"
    }
    ${
      theme === "dark"
        ? "bg-gray-800 border-gray-600"
        : "bg-[rgb(239,242,254)] border-gray-300"
    }
    bg-opacity-90 flex items-center py-4 shadow-lg
    ${isMobile ? "flex-row justify-around " : "flex-col justify-center"}
  `}
>
  {SideBarContent}
</motion.div>
    </>
  );
};