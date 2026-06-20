"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hook";
import { RootState } from "@/src/lib/store/store";
import { updateProfile, UpdateProfileData } from "@/src/lib/store/auth/auth-slice";
import { Status } from "@/src/lib/types/global-types";

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

      formData.append("username", data.username);
      formData.append("about", data.about);
      formData.append("agreed", String(data.agreed));

      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      await dispatch(updateProfile(formData));
      router.push("/profile");
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
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={data.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">About</label>
            <textarea
              name="about"
              value={data.about}
              onChange={handleChange}
              placeholder="Tell people a bit about yourself"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profile Image</label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm text-gray-700"
            />
            {data.profileImage && (
              <p className="mt-2 text-xs text-gray-500">
                Selected file: {data.profileImage.name}
              </p>
            )}
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="agreed"
              checked={data.agreed}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-green-500"
            />
            I agree to update my profile information.
          </label>

          <button
            type="submit"
            disabled={
              profileStatus === Status.LOADING || !data.username.trim() || !data.agreed
            }
            className="w-full rounded-xl bg-green-500 px-4 py-3 text-white transition disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {profileStatus === Status.LOADING ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateProfile;
