"use client";

import { motion } from "framer-motion";
import {
  resendOtp,
  resendPhoneOtp,
  verifyOtp,
} from "@/src/lib/store/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hook";
import { RootState } from "@/src/lib/store/store";
import { Status } from "@/src/lib/types/global-types";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { MessageCircle } from "lucide-react";

const OTPVerification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = searchParams.get("value") ?? "";
  const isEmail = value.includes("@");
  const email = isEmail ? value : "";
  const phone = !isEmail ? value : ""; 

  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: RootState) => state.theme.theme);
  const { otpStatus, user } = useAppSelector((state) => state.auth);

  /* ---------------- STATE ---------------- */
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ---------------- OTP CHANGE ---------------- */
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter full OTP");
      return;
    }

    if (!email && !phone) {
      toast.error("Missing email/phone");
      return;
    }

    dispatch(
      verifyOtp({
        emailOtp: isEmail ? code : undefined,
        email: isEmail ? email : undefined,
        otp: !isEmail ? code : undefined,
        phoneNumber: !isEmail ? phone : undefined,
      })
    );
  };

  /* ---------------- STATUS HANDLING ---------------- */
useEffect(() => {
  if (otpStatus === Status.SUCCESS && user) {
    toast.success("OTP verified successfully!");

    const profileCompleted =
      user.username?.trim() &&
      user.profileImage?.url;

    if (profileCompleted) {
      router.push("/");
    } else {
      router.push("/update-profile");
    }
  }

  if (otpStatus === Status.ERROR) {
    toast.error("Invalid OTP");
  }
}, [otpStatus, user, router]);

  /* ---------------- RESEND OTP ---------------- */
  const handleResendOtp = () => {
    if (!email && !phone) {
      toast.error("Missing email/phone");
      return;
    }

    if (email) {
      dispatch(resendOtp(email));
    } else {
      dispatch(resendPhoneOtp({ phoneNumber: phone }));
    }

    setOtp(Array(6).fill(""));
    setTimer(60);
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
        className={`w-full max-w-md p-8 text-center rounded-[2rem] shadow-2xl border border-[#326E3B]/10 ${
          theme === "dark"
            ? "bg-gray-800 text-white border-green-700"
            : "bg-white text-gray-800"
        }`}
      >

        {/* ICON */}
        <MessageCircle className="w-12 h-12 mx-auto text-[#326E3B] mb-4" />

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-[#326E3B] mb-2">
          OTP Verification
        </h2>

        <p className="text-gray-600 mb-6">
          Enter the 6 digit code sent to{" "}
          <span className="text-[#326E3B] font-medium">
            {email || phone || "your contact"}
          </span>
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* OTP INPUTS */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
  inputRefs.current[index] = el;
}}
                type="text"
                value={digit}
                maxLength={1}
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
                className="w-12 h-12 text-center text-xl rounded-lg border bg-[#f8fff4] text-[#326E3B] focus:ring-2 focus:ring-[#326E3B] outline-none"
              />
            ))}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={otpStatus === Status.LOADING}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              otpStatus === Status.LOADING
                ? "bg-green-300 cursor-not-allowed"
                : "bg-[#326E3B] hover:bg-[#25522d]"
            }`}
          >
            {otpStatus === Status.LOADING
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        {/* RESEND */}
        <div className="mt-6 text-sm text-gray-600">
          {timer > 0 ? (
            <p>
              Resend OTP in{" "}
              <span className="text-[#326E3B] font-semibold">
                {timer}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="text-[#326E3B] font-medium hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
