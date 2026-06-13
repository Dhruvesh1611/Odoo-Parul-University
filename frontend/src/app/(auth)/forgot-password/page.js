"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isLoading, error, setError } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (data) => {
    setSuccessMessage("");
    const message = await requestPasswordReset(data.email);
    if (message) {
      setSuccessMessage(message);
      reset();
      setError(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FBFBF2]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden px-16 py-20 bg-[#1A4D2E]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A4D2E] via-[#1A4D2E]/60 to-transparent" />
        <div className="relative z-10 max-w-xl text-[#FEFCE8] space-y-10">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
            <div className="h-24 w-24 rounded-3xl bg-[#FEFCE8]/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-[#FEFCE8]/20">
              <Image src="/odoo_cafe_logo.png" alt="logo" width={82} height={82} className="object-contain brightness-0 invert" />
            </div>
          </motion.div>
          <h2 className="text-6xl font-extrabold leading-[1.1] tracking-tight text-[#FEFCE8]">
            Reset access,
            <span className="block text-[#4ADE80]">stay in control.</span>
          </h2>
          <p className="text-lg text-[#E8F5E9] leading-relaxed max-w-md opacity-90">
            We’ll send a secure link to your email so you can create a new password without exposing the old one.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-[#FBFBF2]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-[#1A4D2E]/5 border border-[#E8F5E9]">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#1A4D2E]">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A4D2E]">Forgot password</h2>
            <p className="mt-2 text-sm text-[#5F6F65]">Enter your email and we’ll send a reset link.</p>
            {successMessage && <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{successMessage}</p>}
            {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-bold text-[#1A4D2E] ml-1">Email address</label>
              <Input {...register("email", { required: true })} type="email" placeholder="barista@odoocafe.com" className="mt-2 h-14 rounded-2xl border-gray-200 focus:border-[#1A4D2E] focus:ring-[#1A4D2E] bg-gray-50/50" />
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl bg-[#1A4D2E] hover:bg-[#143d24] text-[#FEFCE8] shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
              {isLoading ? "Sending link..." : <span className="flex items-center justify-center gap-2">Send reset link <ArrowRight className="h-5 w-5" /></span>}
            </Button>
          </form>

          <p className="text-center text-sm text-[#5F6F65]">
            Remembered your password? <Link href="/login" className="font-bold text-[#1A4D2E] hover:text-[#143d24]">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}