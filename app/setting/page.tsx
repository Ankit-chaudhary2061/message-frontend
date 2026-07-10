"use client";

import Layout from "@/src/components/layout";
import { logOut } from "@/src/lib/store/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hook";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

export default function SettingPage() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const {user}= useAppSelector((state)=>state.auth)
console.log(user ,":user")
  const isDark = theme === "dark";

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
      <div
        className={`flex h-screen ${
          isDark
            ? "bg-[rgb(17,27,33)] text-white"
            : "bg-white text-black"
        }`}
      >
        {/* Left Settings Sidebar */}
        <aside
          className={`w-[400px] border-r ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="p-5">
            <h1 className="text-2xl font-semibold mb-5">Settings</h1>
<div className="relative mb-4">
  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

  <input
    type="text"
    placeholder="Search settings"
    className={`w-full rounded-lg py-3 pl-10 pr-3 outline-none transition-colors ${
      isDark
        ? "bg-[#202c33] text-white placeholder-gray-400"
        : "bg-gray-100 text-black placeholder-gray-500"
    }`}
  />
</div>
          
          </div>
          <div className={`flex items-center gap-4 p-3 ${ isDark ? "hover: bg-[#202c33]" : "hover: bg-gray-100"} rounded-lg cursor-pointer mb-4`}>
<Image
  src={user?.profileImage?.url || "/default-avatar.png"}
  alt={user?.username || "Profile"}
  width={56}
  height={56}
  className="rounded-full object-cover"
/>
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Account Settings
          </h2>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </main>
      </div>
    </Layout>
  );
}