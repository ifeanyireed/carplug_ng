"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  Car,
  Wrench,
  Eye,
  EyeOff,
  RotateCcw,
  KeyRound,
} from "lucide-react";
import { RojoLogo } from "@/components/common/RojoLogo";
import { useAuth, AuthModalMode } from "@/context/AuthContext";

const ROLE_OPTIONS = [
  { id: "buyer", label: "Buyer", icon: ShieldCheck, desc: "Buy verified cars" },
  { id: "seller", label: "Seller", icon: Car, desc: "Sell personal car" },
  { id: "dealer", label: "Dealer", icon: Building2, desc: "Showroom inventory" },
  { id: "technician", label: "Tech", icon: Wrench, desc: "150-pt inspections" },
] as const;

interface AuthModalProps {
  isOpen?: boolean;
  initialMode?: AuthModalMode;
  onClose?: () => void;
}

export const AuthModal = ({
  isOpen: propsIsOpen,
  initialMode,
  onClose: propsOnClose,
}: AuthModalProps) => {
  const {
    login,
    register,
    verifyCode,
    resendCode,
    requestPasswordReset,
    confirmPasswordReset,
    isAuthModalOpen,
    authModalMode,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    closeAuthModal,
  } = useAuth();

  // Support controlled or context-driven state
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isAuthModalOpen;
  const baseMode = initialMode || authModalMode || "signup";
  const [overrideMode, setOverrideMode] = useState<AuthModalMode | null>(null);
  const mode: AuthModalMode = overrideMode ?? baseMode;

  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "buyer",
  });
  const [showPassword, setShowPassword] = useState(false);

  // OTP State (6 slots)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Password Reset State
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Resend OTP Cooldown
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Active email target for verification / reset
  const targetEmail =
    pendingVerificationEmail ||
    formData.email.trim() ||
    resetEmail.trim();

  // Sync mode changes
  const [prevAuthModalMode, setPrevAuthModalMode] = useState(authModalMode);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (authModalMode !== prevAuthModalMode || isOpen !== prevIsOpen) {
    setPrevAuthModalMode(authModalMode);
    setPrevIsOpen(isOpen);
    setOverrideMode(null);
    setShowPassword(false);
    setShowNewPassword(false);
    setError(null);
    setInfoMessage(null);
    setIsSuccess(false);
  }

  // Handle cooldown countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendCooldown > 0 && (mode === "verify_otp" || mode === "reset_password")) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown, mode]);

  // Auto-focus first OTP slot when entering OTP or reset_password mode
  useEffect(() => {
    if (mode === "verify_otp" || mode === "reset_password") {
      const timer = setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const handleClose = useCallback(() => {
    setError(null);
    setInfoMessage(null);
    setOverrideMode(null);
    setShowPassword(false);
    setShowNewPassword(false);
    setIsSuccess(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "buyer",
    });
    setOtpDigits(["", "", "", "", "", ""]);
    setResetEmail("");
    setNewPassword("");
    if (propsOnClose) {
      propsOnClose();
    } else {
      closeAuthModal();
    }
  }, [propsOnClose, closeAuthModal]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Handle OTP slot input
  const handleOtpChange = (index: number, value: string) => {
    setError(null);
    const cleanVal = value.replace(/\D/g, "");

    // Handle paste of complete 6-digit code
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputsRef.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal ? cleanVal.charAt(cleanVal.length - 1) : "";
    setOtpDigits(newDigits);

    // Auto advance to next slot
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    pastedData.split("").forEach((char, idx) => {
      if (idx < 6) newDigits[idx] = char;
    });
    setOtpDigits(newDigits);
    const focusTarget = Math.min(pastedData.length, 5);
    otpInputsRef.current[focusTarget]?.focus();
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError(null);
    setInfoMessage(null);
    setIsResending(true);

    try {
      const res = await resendCode({
        email: targetEmail,
        type: mode === "reset_password" ? "password_reset" : "signup",
      });
      setResendCooldown(60);
      setInfoMessage(res.message || "A fresh verification code has been dispatched.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code";
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Sign In / Sign Up Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        setIsSuccess(true);
        setSuccessMessage("Signed in successfully!");
        setTimeout(() => {
          setIsSuccess(false);
          handleClose();
        }, 900);
      } else {
        // Sign Up
        const res = await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          role: formData.role,
        });

        // Automatically transition into OTP verification screen
        setPendingVerificationEmail(res.email || formData.email.trim());
        setResendCooldown(60);
        setOverrideMode("verify_otp");
        setInfoMessage(
          "We have sent a 6-digit confirmation code via Brevo. Enter it below to activate your account."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Verification Submit
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await verifyCode({
        email: targetEmail,
        code,
        type: "signup",
      });

      setIsSuccess(true);
      setSuccessMessage("Account verified & activated!");
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 1100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password Request Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToReset = (resetEmail.trim() || formData.email.trim()).toLowerCase();
    if (!emailToReset) {
      setError("Please enter your registered email address.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const res = await requestPasswordReset({ email: emailToReset });
      setPendingVerificationEmail(emailToReset);
      setResetEmail(emailToReset);
      setResendCooldown(60);
      setOverrideMode("reset_password");
      setInfoMessage(
        res.message || "A 6-digit recovery code has been sent to your email address."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset code";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit recovery code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await confirmPasswordReset({
        email: targetEmail,
        code,
        newPassword,
      });

      setIsSuccess(true);
      setSuccessMessage("Password reset successfully!");
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 1100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password reset failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition cursor-pointer"
          aria-label="Close auth dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-2.5 bg-neutral-900 rounded-lg text-white mb-3 shadow-md">
            <RojoLogo className="h-5 w-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "login" && "Welcome Back to CarPlug"}
            {mode === "signup" && "Join CarPlug Nigeria"}
            {mode === "verify_otp" && "Verify Your Email"}
            {mode === "forgot_password" && "Recover Your Account"}
            {mode === "reset_password" && "Create New Password"}
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            {mode === "login" && "Access your saved vehicles, leads, and dashboards"}
            {mode === "signup" && "Create an account to buy, sell, inspect, or manage inventory"}
            {mode === "verify_otp" && (
              <>
                Enter the 6-digit code sent via Brevo to{" "}
                <span className="font-semibold text-gray-800 break-all">{targetEmail}</span>
              </>
            )}
            {mode === "forgot_password" &&
              "Enter your email to receive a 6-digit verification code."}
            {mode === "reset_password" && (
              <>
                Enter the recovery code sent to{" "}
                <span className="font-semibold text-gray-800 break-all">{targetEmail}</span>
              </>
            )}
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Info Banner */}
        {infoMessage && !error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-700 animate-in fade-in duration-150">
            <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{infoMessage}</div>
          </div>
        )}

        {/* Success State Overlay */}
        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{successMessage}</h3>
            <p className="text-xs text-gray-500">Preparing your verified dashboard...</p>
          </div>
        ) : (
          <>
            {/* 1. LOGIN & SIGNUP FORMS */}
            {(mode === "login" || mode === "signup") && (
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {mode === "signup" && (
                  <>
                    {/* Role Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Select Account Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLE_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = formData.role === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, role: opt.id })}
                              className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                                isSelected
                                  ? "border-black bg-neutral-900 text-white shadow-xs"
                                  : "border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-700"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 mt-0.5 shrink-0 ${
                                  isSelected ? "text-white" : "text-gray-500"
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                                <div
                                  className={`text-[10px] truncate ${
                                    isSelected ? "text-gray-300" : "text-gray-400"
                                  }`}
                                >
                                  {opt.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ibrahim Adeyemi"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Phone (Optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="0803 123 4567"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="ibrahim@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Password{" "}
                      {mode === "signup" && (
                        <span className="text-gray-400 font-normal">(min 6 characters)</span>
                      )}
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setInfoMessage(null);
                          setResetEmail(formData.email.trim());
                          setOverrideMode("forgot_password");
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none p-1 transition cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-600 text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md mt-3 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{mode === "login" ? "Verifying credentials..." : "Creating account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "login" ? "Sign In" : "Sign Up & Verify Email"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch Mode Toggle */}
                <div className="pt-2 text-center text-xs text-gray-500">
                  {mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setInfoMessage(null);
                          setOverrideMode("signup");
                        }}
                        className="font-semibold text-black hover:underline cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setInfoMessage(null);
                          setOverrideMode("login");
                        }}
                        className="font-semibold text-black hover:underline cursor-pointer"
                      >
                        Log In
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {/* 2. OTP VERIFICATION FORM (UPON SIGNUP) */}
            {mode === "verify_otp" && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 text-center mb-3">
                    Enter 6-Digit Verification Code
                  </label>

                  {/* 6 Digit Input Slots */}
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-13 text-center text-xl font-bold font-mono bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:outline-none transition shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Verification */}
                <button
                  type="submit"
                  disabled={isSubmitting || otpDigits.join("").length < 6}
                  className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md mt-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verify & Activate Account</span>
                    </>
                  )}
                </button>

                {/* Resend OTP & Change Email Actions */}
                <div className="pt-2 flex flex-col items-center gap-2 text-xs text-gray-500 text-center">
                  <div className="flex items-center gap-1.5">
                    <span>Didn&apos;t receive the code?</span>
                    {resendCooldown > 0 ? (
                      <span className="font-semibold text-gray-600">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isResending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setInfoMessage(null);
                      setOverrideMode("signup");
                    }}
                    className="text-gray-400 hover:text-gray-700 hover:underline transition cursor-pointer text-[11px]"
                  >
                    Change email address or return to signup
                  </button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {mode === "forgot_password" && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="ibrahim@example.com"
                      value={resetEmail || formData.email}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-600 text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending reset code via Brevo...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Recovery Code</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setInfoMessage(null);
                      setOverrideMode("login");
                    }}
                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-black font-semibold transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* 4. RESET PASSWORD WITH RECOVERY CODE */}
            {mode === "reset_password" && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 text-center mb-2.5">
                    6-Digit Recovery Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-13 text-center text-xl font-bold font-mono bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-black focus:bg-white focus:outline-none transition shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      New Password <span className="text-gray-400 font-normal">(min 6 characters)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      {showNewPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpDigits.join("").length < 6 || newPassword.length < 6}
                  className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md mt-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Reset Password & Sign In</span>
                    </>
                  )}
                </button>

                <div className="pt-2 flex flex-col items-center gap-2 text-xs text-gray-500 text-center">
                  <div className="flex items-center gap-1.5">
                    <span>Didn&apos;t receive code?</span>
                    {resendCooldown > 0 ? (
                      <span className="font-semibold text-gray-600">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isResending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setInfoMessage(null);
                      setOverrideMode("login");
                    }}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-black font-semibold transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
