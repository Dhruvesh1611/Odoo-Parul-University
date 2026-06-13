"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { resetPassword, isLoading, error, setError } = useAuthStore();
  const { register, handleSubmit, watch } = useForm();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Reset link is missing or invalid.");
    }
  }, [token, setError]);

  const onSubmit = async (data) => {
    setSuccessMessage("");
    if (!token) return;

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const message = await resetPassword(token, data.password);
    if (message) {
      setSuccessMessage(message);
      setError(null);
      setTimeout(() => router.push("/login"), 1200);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FBFBF2]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden px-16 py-20 bg-[#1A4D2E]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A4D2E] via-[#1A4D2E]/60 to-transparent" />
        <div className="relative z-10 max-w-xl text-[#FEFCE8] space-y-10">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
            <div className="h-24 w-24 rounded-3xl bg-[#FEFCE8]/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-[#FEFCE8]/20">
              <Image src="/odoo_cafe_logo.png" alt="logo" width={82} height={82} className="object-contain brightness-0 invert" />
            </div>
          </motion.div>
          <h2 className="text-6xl font-extrabold leading-[1.1] tracking-tight text-[#FEFCE8]">
            Create a new
            <span className="block text-[#4ADE80]">secure password.</span>
          </h2>
          <p className="text-lg text-[#E8F5E9] leading-relaxed max-w-md opacity-90">
            Your reset link is verified by email. Choose a strong password you can keep safe.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-[#FBFBF2]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-[#1A4D2E]/5 border border-[#E8F5E9]">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#1A4D2E]">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A4D2E]">Reset password</h2>
            <p className="mt-2 text-sm text-[#5F6F65]">Enter your new password below.</p>
            {successMessage && <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{successMessage}</p>}
            {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-bold text-[#1A4D2E] ml-1">New password</label>
              <Input {...register("password", { required: true })} type="password" placeholder="••••••••" className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-[#1A4D2E] focus:ring-[#1A4D2E] bg-gray-50/50" />
            </div>
            <div>
              <label className="text-sm font-bold text-[#1A4D2E] ml-1">Confirm password</label>
              <Input {...register("confirmPassword", { required: true })} type="password" placeholder="••••••••" className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-[#1A4D2E] focus:ring-[#1A4D2E] bg-gray-50/50" />
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl bg-[#1A4D2E] hover:bg-[#143d24] text-[#FEFCE8] shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading || !token}>
              {isLoading ? "Updating..." : <span className="flex items-center justify-center gap-2">Update password <ArrowRight className="h-5 w-5" /></span>}
            </Button>
          </form>

          <p className="text-center text-sm text-[#5F6F65]">
            Back to <Link href="/login" className="font-bold text-[#1A4D2E] hover:text-[#143d24]">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}