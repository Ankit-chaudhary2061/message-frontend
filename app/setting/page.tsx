"use client";

import Layout from "@/src/components/layout";
import { logOut } from "@/src/lib/store/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hook";
import { toggleThemeDialog } from "@/src/lib/store/layout/ui-slice";
import Image from "next/image";
import Link from "next/link";
import { FaComment, FaMoon, FaQuestionCircle, FaSearch, FaSignInAlt, FaSun } from "react-icons/fa";
import { toast } from "react-toastify";

export default function SettingPage() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const {user}= useAppSelector((state)=>state.auth)
console.log(user ,":user")
  const isDark = theme === "dark";
const menuItems = [
  {
    icon: FaSearch,
    label: "Account",
    href: "/user-profile",
  },
  {
    icon: FaComment,
    label: "Chats",
    href: "/home",
  },
  {
    icon: FaQuestionCircle,
    label: "Help",
    href: "/help",
  },
];
const handleToggleThemeDialog = () => {
  dispatch(toggleThemeDialog());
};
  const handleLogout = async () => {
    try {
      await dispatch(logOut());
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
  <Layout>
  <aside
    className={`flex h-screen w-full flex-col border-r ${
      isDark
        ? "bg-[rgb(17,27,33)] border-gray-700 text-white"
        : "bg-white border-gray-200 text-black"
    }`}
  >
    {/* Header */}
    <div className="p-5">
      <h1 className="mb-5 text-2xl font-semibold">Settings</h1>

      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search settings"
          className={`w-full rounded-lg py-3 pl-10 pr-3 outline-none ${
            isDark
              ? "bg-[#202c33] text-white placeholder-gray-400"
              : "bg-gray-100 text-black placeholder-gray-500"
          }`}
        />
      </div>
    </div>

    {/* Profile */}
    <Link
      href="/user-profile"
      className={`mx-3 mb-4 flex items-center gap-4 rounded-lg p-3 transition-colors ${
        isDark ? "hover:bg-[#202c33]" : "hover:bg-gray-100"
      }`}
    >
      <Image
        src={user?.profileImage?.url || "/default-avatar.png"}
        alt="Profile"
        width={56}
        height={56}
        className="rounded-full object-cover"
      />

      <div>
        <h2 className="font-semibold">{user?.username}</h2>
        <p className="text-sm text-gray-400">{user?.about}</p>
      </div>
    </Link>

    {/* Menu */}
    <div className="flex-1 overflow-y-auto px-3">
      {menuItems.map(({ icon: Icon, label, href }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-4 rounded-lg border-b px-3 py-4 transition-colors ${
            isDark
              ? "border-gray-700 hover:bg-[#202c33]"
              : "border-gray-200 hover:bg-gray-100"
          }`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}

      {/* Theme */}
      <button
        onClick={handleToggleThemeDialog}
        className={`flex w-full items-center gap-4 rounded-lg border-b px-3 py-4 transition-colors ${
          isDark
            ? "border-gray-700 hover:bg-[#202c33]"
            : "border-gray-200 hover:bg-gray-100"
        }`}
      >
        {isDark ? <FaMoon size={20} /> : <FaSun size={20} />}

        <div className="flex flex-1 items-center justify-between">
          <span>Theme</span>
          <span className="capitalize text-sm text-gray-400">{theme}</span>
        </div>
      </button>
    </div>

    {/* Logout */}
    <div className="border-t p-3 border-gray-200 dark:border-gray-700">
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-4 rounded-lg p-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <FaSignInAlt size={20} />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</Layout>
  );
}