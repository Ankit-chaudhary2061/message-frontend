"use client";

import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaChevronDown, FaWhatsapp } from "react-icons/fa";

import countries from "@/src/lib/utiil/countries";
import Spinner from "@/src/lib/utiil/spinner";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hook";
import { RootState } from "@/src/lib/store/store";
import { loginUser } from "@/src/lib/store/auth/auth-slice";
import { Status } from "@/src/lib/types/global-types";

const defaultCountry = countries[0] ?? {
  name: "United States",
  dialCode: "+1",
  code: "US",
  flag: "🇺🇸",
};

const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const theme = useAppSelector((state: RootState) => state.theme.theme);
  const { loginStatus } = useAppSelector((state) => state.auth);

  /* ---------------- STATE (AUTH INPUTS) ---------------- */
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  /* ---------------- STATE (COUNTRY DROPDOWN) ---------------- */
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [showDropDown, setShowDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---------------- STATE (ERROR) ---------------- */
  const [errorMessage, setErrorMessage] = useState("");

  /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropDown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /* ---------------- RESET ON MODE CHANGE ---------------- */
  useEffect(() => {
    setShowDropDown(false);
    setSearchTerm("");

    if (mode === "phone") setEmail("");
    else setPhoneNumber("");
  }, [mode]);

  /* ---------------- FILTER COUNTRIES ---------------- */
  const filteredCountries = useMemo(() => {
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dialCode.includes(searchTerm)
    );
  }, [searchTerm]);

  /* ---------------- SUBMIT STATE ---------------- */
 const isSubmitDisabled =
  loginStatus === Status.LOADING ||
  !(mode === "phone" ? phoneNumber.trim() : email.trim());

  /* ---------------- BUILD IDENTIFIER (IMPORTANT FIX) ---------------- */
 const identifier =
  mode === "phone"
    ? `${selectedCountry.dialCode}${phoneNumber.trim()}`
    : email.trim();
  /* ---------------- STATUS HANDLER ---------------- */
  useEffect(() => {
    if (loginStatus === Status.ERROR) {
      const message =
        "Registration failed. Email already exists. Please try again.";

      setErrorMessage(message);
      toast.error(message);

      const timeout = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timeout);
    }

   if (loginStatus === Status.SUCCESS) {
  toast.success("OTP sent successfully. Please verify OTP.");

  if (mode === "phone") {
    router.push(
      `/otp-verification?phone=${encodeURIComponent(
        phoneNumber.trim()
      )}&suffix=${encodeURIComponent(selectedCountry.dialCode)}`
    );
  } else {
    router.push(
      `/otp-verification?email=${encodeURIComponent(email.trim())}`
    );
  }
}
  }, [loginStatus, mode, phoneNumber, email, selectedCountry]);

  /* ---------------- SUBMIT HANDLER ---------------- */
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (loginStatus === Status.LOADING) {
    toast.info("Request already in progress");
    return;
  }

  toast.info("Sending OTP...");

  try {
    await dispatch(
      loginUser({
        phoneNumber:
          mode === "phone"
            ? phoneNumber.trim()
            : undefined,

        phoneSuffix:
          mode === "phone"
            ? selectedCountry.dialCode
            : undefined,

        email:
          mode === "email"
            ? email.trim()
            : undefined,
      })
    );
  } catch (error: any) {
    console.error(error);
    const message =
      (error && (error.message || error?.error || error?.message?.toString())) ||
      "Failed to send OTP";
    toast.error(typeof message === "string" ? message : "Failed to send OTP");
  }
};

  /* ---------------- UI ---------------- */
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-green-400 to-blue-500"
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

        <h1 className="text-3xl font-bold text-center">WhatsApp</h1>
        <p className="text-center text-sm opacity-70 mb-6">
          Login to continue
        </p>

        {/* MODE SWITCH */}
        <div className="flex mb-4 border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={`flex-1 py-2 ${
              mode === "phone"
                ? "bg-green-500 text-white"
                : "bg-white text-black"
            }`}
          >
            Phone
          </button>

          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex-1 py-2 ${
              mode === "email"
                ? "bg-green-500 text-white"
                : "bg-white text-black"
            }`}
          >
            Email
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PHONE INPUT */}
          {mode === "phone" ? (
            <div
              ref={dropdownRef}
              className="relative bg-white rounded-lg border shadow-sm"
            >
              <div className="flex items-center border-b">
                <button
                  type="button"
                  onClick={() => setShowDropDown((p) => !p)}
                  className="flex items-center gap-2 px-3 py-3 bg-gray-100 border-r"
                >
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                  <FaChevronDown />
                </button>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 p-3 outline-none text-black text-sm"
                />
              </div>

              {/* COUNTRY DROPDOWN */}
              {showDropDown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto z-50">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search country..."
                   className={`w-full px-2 py-1 border ${
  theme === "dark"
    ? "bg-gray-600 border-gray-500 text-white"
    : "bg-white border-gray-300"
} rounded-md text-sm focus:ring-2 focus:ring-green-500`}
                  />

                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowDropDown(false);
                        setSearchTerm("");
                      }}
                      className={`w-full px-3 py-2 text-left transition ${
  theme === "dark"
    ? "hover:bg-gray-700"
    : "hover:bg-gray-100"
}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {country.dialCode}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* EMAIL INPUT */
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full p-3 border rounded-lg outline-none text-black text-sm"
            />
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg flex justify-center"
          >
            {loginStatus === Status.LOADING ? <Spinner /> : "Send OTP"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;