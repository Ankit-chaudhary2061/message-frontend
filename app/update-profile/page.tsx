"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaUser, FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hook";
import { RootState } from "@/src/lib/store/store";
import { updateProfile } from "@/src/lib/store/auth/auth-slice";
import Spinner from "@/src/lib/utiil/spinner";
import { Status } from "@/src/lib/types/global-types";
import { FaInfoCircle } from "react-icons/fa";
const UpdateProfile = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
const { profileStatus } = useAppSelector((state) => state.auth);
  const theme = useAppSelector(
    (state: RootState) => state.theme.theme
  );

const [username, setUsername] = useState("");
const [about, setAbout] = useState("");
const [agreed, setAgreed] = useState(false);

const [profileImage, setProfileImage] = useState<File | null>(null);
const [previewImage, setPreviewImage] = useState("");
const [selectedAvatar, setSelectedAvatar] = useState("");

const handleImageChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setProfileImage(file);
  setPreviewImage(URL.createObjectURL(file));
  setSelectedAvatar("");
};
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("username", username);
    formData.append("about", about);
    formData.append("agreed", String(agreed));

    if (profileImage) {
  formData.append("profileImage", profileImage);
}

if (selectedAvatar) {
  formData.append("avatar", selectedAvatar);
}

    try {
      const response = await dispatch(updateProfile(formData));

      if (response.success) {
        router.push("/home");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const isDark = theme === "dark";
  const inputClass = `w-full rounded-xl border px-4 py-3 transition-all duration-300
${
  isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
}
focus:outline-none focus:ring-2 focus:ring-green-500`;

const iconClass = isDark ? "text-gray-400" : "text-gray-500";

const labelClass = `mb-2 block text-sm font-medium ${
  isDark ? "text-gray-300" : "text-gray-700"
}`;
const avatars = [
  "https://api.dicebear.com/9.x/notionists/png?seed=Alex",
  "https://api.dicebear.com/9.x/notionists/png?seed=Emma",
  "https://api.dicebear.com/9.x/notionists/png?seed=John",
  "https://api.dicebear.com/9.x/notionists/png?seed=Lucas",
  "https://api.dicebear.com/9.x/notionists/png?seed=Olivia",
  "https://api.dicebear.com/9.x/notionists/png?seed=James",
  "https://api.dicebear.com/9.x/notionists/png?seed=Mia",
  "https://api.dicebear.com/9.x/notionists/png?seed=Noah",
];
console.log(avatars);
  return (
   <div
  className={`min-h-screen flex items-center justify-center px-4 py-10 transition-all duration-500 ${
    isDark
      ? "bg-gradient-to-br from-slate-900 via-gray-900 to-black"
      : "bg-gradient-to-br from-green-100 via-white to-green-200"
  }`}
>
      <motion.div
  initial={{ opacity: 0, scale: 0.9, y: 40 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className={`w-full max-w-lg rounded-3xl border backdrop-blur-xl shadow-2xl p-8 ${
    isDark
      ? "bg-gray-900/80 border-gray-700 text-white"
      : "bg-white/80 border-white text-gray-900"
  }`}
>
        {/* Header */}
      {/* <div className="flex flex-col items-center mb-8">
  <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl">
    <FaWhatsapp className="text-white text-5xl" />
  </div>

  <h1 className="mt-5 text-3xl font-bold">
    Complete your profile
  </h1>

  <p
    className={`mt-2 text-center ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  >
    Choose a profile picture and tell everyone
    a little about yourself.
  </p>
</div> */}
<div className="mb-8 flex flex-col items-center">
  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-xl">
    <FaWhatsapp className="text-5xl text-white" />
  </div>

  <h1 className="mt-5 text-3xl font-bold">
    Complete Your Profile
  </h1>

  <p
    className={`mt-2 max-w-sm text-center ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  >
    Choose a profile picture and tell everyone a little
    about yourself.
  </p>
</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image */}
    {/* <div className="mb-6 flex flex-col items-center">
  {/* Selected Image */}
  {/* <div className="relative mb-3 h-24 w-24">
    <Image
      src={
        previewImage ||
        selectedAvatar ||
        "/default-avatar.png"
      }
      alt="Profile"
      fill
      className="rounded-full object-cover border-2 border-green-500"
    />

    <label
      htmlFor="profile-picture"
      className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-green-500 p-2 text-white transition hover:bg-green-600"
    >
      <FaPlus size={14} />
    </label>

    <input
      id="profile-picture"
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />
  </div> */}

  {/* <p
    className={`mb-4 text-sm ${
      isDark ? "text-gray-300" : "text-gray-500"
    }`}
  >
    Choose an avatar or upload your own
  </p> */}

  {/* Avatar Grid */}
  {/* <div className="grid grid-cols-4 gap-3">
    {avatars.map((avatar, index) => (
      <button
        type="button"
        key={index}
        onClick={() => {
          setSelectedAvatar(avatar);
          setPreviewImage("");
          setProfileImage(null);
        }}
        className={`overflow-hidden rounded-full transition-transform duration-300 hover:scale-110 ${
          selectedAvatar === avatar
            ? "ring-2 ring-green-500 ring-offset-2"
            : ""
        }`}
      >
        <Image
          src={avatar}
          alt={`Avatar ${index + 1}`}
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
      </button>
    ))}
  </div> */}
{/* </div> */} *


<div className="mb-8 flex flex-col items-center">
  <div className="relative h-28 w-28">
    <Image
      src={
        previewImage ||
        selectedAvatar ||
        "/default-avatar.png"
      }
      alt="Profile"
      fill
      className="rounded-full border-4 border-green-500 object-cover shadow-lg"
    />

    <label
      htmlFor="profile-picture"
      className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
    >
      <FaPlus />
    </label>

    <input
      id="profile-picture"
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />
  </div>

  <p
    className={`mt-4 text-sm ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  >
    Upload your photo or choose an avatar
  </p>

  <div className="mt-5 grid grid-cols-4 gap-4">
    {avatars.map((avatar, index) => (
      <button
        key={index}
        type="button"
        onClick={() => {
          setSelectedAvatar(avatar);
          setPreviewImage("");
          setProfileImage(null);
        }}
        className={`overflow-hidden rounded-full transition duration-300 hover:scale-110 ${
          selectedAvatar === avatar
            ? "ring-4 ring-green-500"
            : ""
        }`}
      >
        <Image
          src={avatar}
          alt={`Avatar ${index + 1}`}
          width={60}
          height={60}
          className="rounded-full object-cover"
        />
      </button>
    ))}
  </div>
</div>
{/* <div className="relative">
  <FaUser
    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  />

  <input
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className={`w-full pl-10 pr-3 py-3 border rounded-lg text-lg transition-colors duration-200
      ${
        isDark
          ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
      }
      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
  />
</div> */}

<div>
  <label className={labelClass}>
    Username
  </label>

  <div className="relative">
    <FaUser
      className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconClass}`}
    />

    <input
      type="text"
      placeholder="Enter username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className={`${inputClass} pl-11`}
    />
  </div>
</div>
{/* <div>
  <label
    className={`mb-2 block text-sm font-medium ${
      isDark ? "text-gray-300" : "text-gray-700"
    }`}
  >
    About
  </label>

  <div className="relative">
    <FaInfoCircle
      className={`absolute left-3 top-4 ${
        isDark ? "text-gray-400" : "text-gray-500"
      }`}
    />

    <textarea
      value={about}
      onChange={(e) => setAbout(e.target.value)}
      placeholder="Tell people something about yourself..."
      rows={4}
      className={`w-full rounded-lg border pl-10 pr-3 py-3 text-base transition-colors duration-200 resize-none
        ${
          isDark
            ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
        }
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
    />
  </div>

  <p
    className={`mt-2 text-xs ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  >
    {about.length}/150 characters
  </p>
</div> */}

<div>
  <label className={labelClass}>
    About
  </label>

  <div className="relative">
    <FaInfoCircle
      className={`absolute left-4 top-4 ${iconClass}`}
    />

    <textarea
      rows={4}
      maxLength={150}
      value={about}
      onChange={(e) => setAbout(e.target.value)}
      placeholder="Tell people something about yourself..."
      className={`${inputClass} resize-none pl-11`}
    />
  </div>

  <p
    className={`mt-2 text-right text-xs ${
      isDark ? "text-gray-400" : "text-gray-500"
    }`}
  >
    {about.length}/150
  </p>
</div>
     {/* <div className="flex items-center space-x-2">
  <input
    id="terms"
    type="checkbox"
    checked={agreed}
    onChange={(e) => setAgreed(e.target.checked)}
    className={`h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-2 focus:ring-green-500 ${
      isDark
        ? "bg-gray-700 border-gray-600"
        : "bg-white border-gray-300"
    }`}
  />

  <label
    htmlFor="terms"
    className={`text-sm ${
      isDark ? "text-gray-300" : "text-gray-700"
    }`}
  >
    I agree to the{" "}
    <a
      href="#"
      className="font-medium text-green-500 hover:underline"
    >
      Terms and Conditions
    </a>
  </label>
</div> */}
<div className="flex items-center gap-3">
  <input
    id="terms"
    type="checkbox"
    checked={agreed}
    onChange={(e) => setAgreed(e.target.checked)}
    className="h-5 w-5 rounded text-green-500 focus:ring-green-500"
  />

  <label
    htmlFor="terms"
    className={`text-sm ${
      isDark ? "text-gray-300" : "text-gray-700"
    }`}
  >
    I agree to the{" "}
    <button
      type="button"
      className="font-semibold text-green-500 hover:underline"
    >
      Terms & Conditions
    </button>
  </label>
</div>

     {/* <button
  type="submit"
  disabled={profileStatus === Status.LOADING}
  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg flex justify-center items-center"
>
  {profileStatus === Status.LOADING ? <Spinner /> : "Save Profile"}
</button> */}

<button
  type="submit"
  disabled={
    profileStatus === Status.LOADING ||
    !username.trim() ||
    !agreed
  }
  className="flex w-full items-center justify-center rounded-xl bg-green-500 py-3 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
>
  {profileStatus === Status.LOADING ? (
    <Spinner />
  ) : (
    "Save Profile"
  )}
</button>

        </form>
      </motion.div>
    </div>
  );



};

export default UpdateProfile;