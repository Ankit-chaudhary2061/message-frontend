"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  FaCamera,
  FaCheck,
  FaPencilAlt,
  FaSmile,
} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";

import Layout from "./layout";

import { useAppDispatch, useAppSelector } from "../lib/store/hook";
import { fetchMe, updateProfile } from "../lib/store/auth/auth-slice";

const UserDetails = () => {
      const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.theme);

  const isDark = theme === "dark";

  /* ---------------------------- States ---------------------------- */

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  const [showNameEmoji, setShowNameEmoji] = useState(false);
  const [showAboutEmoji, setShowAboutEmoji] = useState(false);

  /* ---------------------------- Fetch User ---------------------------- */

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    setName(user.username || "");
    setAbout(user.about || "");
    setPreview(user.profileImage?.url || "");
  }, [user]);

  /* ---------------------------- Image Preview ---------------------------- */

  useEffect(() => {
    if (!profilePicture) return;

    const objectUrl = URL.createObjectURL(profilePicture);

    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicture]);

  /* ---------------------------- Image Change ---------------------------- */

 const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (!file) return;

  console.log("Name:", file.name);
  console.log("Type:", file.type);

  setProfilePicture(file);
};

  /* ---------------------------- Save ---------------------------- */

  const handleSave = async (
    field: "profile" | "name" | "about"
  ) => {
    try {
      setLoading(true);

      const formData = new FormData();

      switch (field) {
        case "profile":
          if (profilePicture) {
            formData.append("profileImage", profilePicture);
          }
          break;

        case "name":
          formData.append("username", name);
          break;

        case "about":
          formData.append("about", about);
          break;
      }

      await dispatch(updateProfile(formData));

      await dispatch(fetchMe());

      setProfilePicture(null);

      setIsEditingName(false);
      setIsEditingAbout(false);

      setShowNameEmoji(false);
      setShowAboutEmoji(false);

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------- Cancel Image ---------------------------- */

  const discardImage = () => {
    setProfilePicture(null);
    setPreview(user?.profileImage?.url || "");
  };

  /* ---------------------------- Emoji ---------------------------- */

  const handleEmojiSelect = (
    emoji: EmojiClickData,
    field: "name" | "about"
  ) => {
    if (field === "name") {
      setName((prev) => prev + emoji.emoji);
      setShowNameEmoji(false);
    } else {
      setAbout((prev) => prev + emoji.emoji);
      setShowAboutEmoji(false);
    }
  };

  const imageSrc =
    preview ||
    user?.profileImage?.url ||
    "/default-avatar.png";

  
   return (
  <Layout>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen p-8 ${
        isDark
          ? "bg-[#111b21] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="mt-2 text-gray-400">
            Update your profile information
          </p>
        </div>

        {/* Main Card */}
        <div
          className={`rounded-2xl shadow-lg overflow-hidden ${
            isDark ? "bg-[#202c33]" : "bg-white"
          }`}
        >
          {/* ================= Profile Picture ================= */}

          <div className="flex flex-col items-center border-b border-gray-700 p-8">

            <div className="group relative">

              <Image
                src={imageSrc}
                alt="Profile"
                width={180}
                height={180}
                className="h-44 w-44 rounded-full border-4 border-green-500 object-cover"
              />

              <label
                htmlFor="profileUpload"
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100"
              >
                <div className="text-center text-white">
                  <FaCamera className="mx-auto mb-2 text-3xl" />
                  <p>Change</p>
                </div>
              </label>

              <input
                id="profileUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {profilePicture && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => handleSave("profile")}
                  className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                >
                  Save
                </button>

                <button
                  onClick={discardImage}
                  className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ================= Name ================= */}

          <div className="border-b border-gray-700 p-6">

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm text-green-500">Your Name</h3>

              {!isEditingName && (
                <button onClick={() => setIsEditingName(true)}>
                  <FaPencilAlt />
                </button>
              )}
            </div>

            {isEditingName ? (
              <>
                <div className="flex items-center gap-3">

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`flex-1 rounded-lg border px-4 py-3 outline-none ${
                      isDark
                        ? "border-gray-600 bg-[#2a3942]"
                        : "border-gray-300"
                    }`}
                  />

                  <button onClick={() => handleSave("name")}>
                    <FaCheck className="text-green-500" />
                  </button>

                  <button
                    onClick={() =>
                      setShowNameEmoji(!showNameEmoji)
                    }
                  >
                    <FaSmile className="text-yellow-500" />
                  </button>

                  <button
                    onClick={() => {
                      setName(user?.username || "");
                      setIsEditingName(false);
                      setShowNameEmoji(false);
                    }}
                  >
                    <MdCancel className="text-red-500" />
                  </button>

                </div>

                {showNameEmoji && (
                  <div className="mt-4">
                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        handleEmojiSelect(emoji, "name")
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-lg">{name}</p>
            )}
          </div>

          {/* ================= About ================= */}

          <div className="p-6">

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm text-green-500">About</h3>

              {!isEditingAbout && (
                <button onClick={() => setIsEditingAbout(true)}>
                  <FaPencilAlt />
                </button>
              )}
            </div>

            {isEditingAbout ? (
              <>
                <textarea
                  rows={3}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 outline-none ${
                    isDark
                      ? "border-gray-600 bg-[#2a3942]"
                      : "border-gray-300"
                  }`}
                />

                <div className="mt-4 flex justify-end gap-4">

                  <button
                    onClick={() =>
                      setShowAboutEmoji(!showAboutEmoji)
                    }
                  >
                    <FaSmile className="text-yellow-500 text-xl" />
                  </button>

                  <button onClick={() => handleSave("about")}>
                    <FaCheck className="text-green-500 text-xl" />
                  </button>

                  <button
                    onClick={() => {
                      setAbout(user?.about || "");
                      setIsEditingAbout(false);
                      setShowAboutEmoji(false);
                    }}
                  >
                    <MdCancel className="text-red-500 text-xl" />
                  </button>

                </div>

                {showAboutEmoji && (
                  <div className="mt-4">
                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        handleEmojiSelect(emoji, "about")
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <p>{about || "Hey there! I am using Chat App."}</p>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  </Layout>
);
}



export default UserDetails