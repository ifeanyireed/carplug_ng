"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  Car,
  Wrench,
  Eye,
  EyeOff,
} from "lucide-react";
import { RojoLogo } from "@/components/common/RojoLogo";
import { useAuth } from "@/context/AuthContext";

const ROLE_OPTIONS = [
  { id: "buyer", label: "Buyer", icon: ShieldCheck, desc: "Buy verified cars" },
  { id: "seller", label: "Seller", icon: Car, desc: "Sell personal car" },
  { id: "dealer", label: "Dealer", icon: Building2, desc: "Showroom inventory" },
  { id: "technician", label: "Tech", icon: Wrench, desc: "150-pt inspections" },
] as const;

interface AuthModalProps {
  isOpen?: boolean;
  initialMode?: "login" | "signup";
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
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
  } = useAuth();

  // Support controlled or context-driven state
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isAuthModalOpen;
  const baseMode = initialMode || authModalMode || "signup";
  const [overrideMode, setOverrideMode] = useState<"login" | "signup" | null>(null);
  const mode = overrideMode ?? baseMode;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "buyer",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Cleanly reset override mode, password visibility, and errors whenever modal open status or requested mode changes
  useEffect(() => {
    setOverrideMode(null);
    setShowPassword(false);
    setError(null);
  }, [authModalMode, isOpen]);

  const handleClose = () => {
    setError(null);
    setOverrideMode(null);
    setShowPassword(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "buyer",
    });
    if (propsOnClose) {
      propsOnClose();
    } else {
      closeAuthModal();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });
      } else {
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          role: formData.role,
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition"
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
            {mode === "login" ? "Welcome Back to Verza" : "Join Verza Marketplace"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === "login"
              ? "Access your saved vehicles, leads, and dashboards"
              : "Create an account to buy, sell, inspect, or manage inventory"}
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {mode === "login" ? "Signed in successfully!" : "Account created successfully!"}
            </h3>
            <p className="text-xs text-gray-500">Preparing your verified dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                          className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition ${
                            isSelected
                              ? "border-black bg-neutral-900 text-white shadow-xs"
                              : "border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-700"
                          }`}
                        >
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-white" : "text-gray-500"}`} />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                            <div className={`text-[10px] truncate ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
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
                  Password {mode === "signup" && <span className="text-gray-400 font-normal">(min 6 characters)</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide password</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show password</span>
                    </>
                  )}
                </button>
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
                  <span>{mode === "login" ? "Sign In" : "Sign Up"}</span>
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
      </div>
    </div>
  );
};
