"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaPlus, FaUser, FaWhatsapp } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hook";
import { RootState } from "@/src/lib/store/store";
import { updateProfile, UpdateProfileData } from "@/src/lib/store/auth/auth-slice";
import { Status } from "@/src/lib/types/global-types";
import Image from "next/image";

const UpdateProfile = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: RootState) => state.theme.theme);
  const profileStatus = useAppSelector((state: RootState) => state.auth.profileStatus);
const avatars = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Emma",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Alex",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Sophia",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Noah",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Olivia",
];



  const [data, setData] = useState<UpdateProfileData>({
    username: "",
    about: "",
    agreed: false,
    profileImage: null,
  });
const [avatar,setAvatar] = useState(avatars[0])
const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  setData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
const handleCheckboxChange = (
  e: ChangeEvent<HTMLInputElement>
) => {
  setData((prev) => ({
    ...prev,
    agreed: e.target.checked,
  }));
};
const handleImageChange = (
  e: ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setData((prev) => ({
    ...prev,
    profileImage: file,
  }));
};

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    formData.append("username", data.username.trim());
    formData.append("about", data.about.trim());
    formData.append("agreed", String(data.agreed));

    if (data.profileImage) {
      formData.append("profileImage", data.profileImage);
    } else if (avatar) {
      formData.append("avatar", avatar);
    }

    await dispatch(updateProfile(formData));

    router.push("/home");
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-linear-to-br from-green-400 to-blue-500"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${
          theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        {/* HEADER */}
        <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-5">
          <FaWhatsapp className="text-white text-5xl" />
        </div>

        <h1 className="text-3xl font-bold text-center">Update Profile</h1>
        <p className="text-center text-sm opacity-70 mb-6">
          Update your username, bio, and profile image.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center mb-4">
  <div className="relative w-24 h-24 mb-2">
    <Image
      src={
        data.profileImage
          ? URL.createObjectURL(data.profileImage)
          : avatar
      }
      alt="Profile"
      fill
      unoptimized
      className="rounded-full object-cover"
    />

    <label
      htmlFor="profile-picture"
      className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600"
    >
      <FaPlus className="w-4 h-4" />
    </label>

    <input
      type="file"
      id="profile-picture"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />
  </div>

  <p
    className={`text-sm ${
      theme === "dark"
        ? "text-gray-300"
        : "text-gray-500"
    } mb-2`}
  >
    Choose an avatar
  </p>

  <div className="flex gap-2 flex-wrap justify-center">
    {avatars.map((item, index) => (
      <Image
        key={index}
        src={item}
        alt={`Avatar ${index + 1}`}
        width={48}
        height={48}        unoptimized        onClick={() => setAvatar(item)}
        className={`rounded-full cursor-pointer transition hover:scale-110 ${
          avatar === item
            ? "ring-2 ring-green-500"
            : ""
        }`}
      />
    ))}
  </div>
</div>
  {/* Username */}
  <div className="relative">
    <FaUser
      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
        theme === "dark"
          ? "text-gray-400"
          : "text-gray-500"
      }`}
    />

    <input
      type="text"
      name="username"
      value={data.username}
      onChange={handleChange}
      placeholder="Enter username"
      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
        theme === "dark"
          ? "bg-gray-700 border-gray-600 text-white"
          : "bg-white border-gray-300"
      }`}
    />
  </div>

           <div>
    <label className="block text-sm font-medium mb-2">
      About
    </label>

    <textarea
      name="about"
      value={data.about}
      onChange={handleChange}
      placeholder="Tell people a bit about yourself"
      className={`w-full rounded-xl border px-4 py-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500 ${
        theme === "dark"
          ? "bg-gray-700 border-gray-600 text-white"
          : "bg-white border-gray-300"
      }`}
    />
  </div>

       

          {/* Agreement */}
  <label className="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={data.agreed}
      onChange={handleCheckboxChange}
      className="h-4 w-4"
    />

    I agree to update my profile information.
  </label>

  {/* Submit Button */}
  <button
    type="submit"
    disabled={
      profileStatus === Status.LOADING ||
      !data.username.trim() ||
      !data.agreed
    }
    className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-medium transition hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
  >
    {profileStatus === Status.LOADING
      ? "Saving..."
      : "Save Profile"}
  </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateProfile;
