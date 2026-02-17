"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validation";
import { LoginInput } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabaseClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // login by google
    async function handleLoginByGoogle() {
        try {
            const supabase = supabaseClient; 

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || `Failed to login with Google`);
        }
    }

    async function onSubmit(data: LoginInput) {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Invalid email or password");
            }

            toast.success("Login successfully! Welcome back!");
            router.refresh();
            router.push(result.redirectPath);
        } catch (error: any) {
            toast.error(error.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F7FB] px-4">
            <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm border border-[#E5E7EB]">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold text-[#1F2937]">Login Account</h1>
                    <p className="text-sm text-[#6B7280]">Continue for shopping your baby needs</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="john@gmail.com"
                            className={`w-full rounded-lg border px-3 py-2 text-[#1F2937] transition focus:outline-none focus:ring-2 
                            ${errors.email ? "border-red-500 focus:ring-red-200" : "border-[#E5E7EB] focus:ring-[#818CF8]"}`}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className={`w-full rounded-lg border px-3 py-2 pr-10 text-[#1F2937] transition focus:outline-none focus:ring-2 
                                ${errors.password ? "border-red-500 focus:ring-red-200" : "border-[#E5E7EB] focus:ring-[#818CF8]"}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-[#9CA3AF] hover:text-[#6875F5]"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-[#6875F5] py-2 text-white font-medium hover:bg-[#5A67D8] transition disabled:opacity-60"
                    >
                        {loading ? "Loading..." : "Login"}
                    </button>
                </form>

                {/* DIVIDER */}
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
                </div>

                {/* login by google */}
                <button 
                    type="button" 
                    onClick={handleLoginByGoogle} 
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] py-2 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="Google" />
                    Google
                </button>

                <p className="text-center text-sm text-[#6B7280]">
                    New here? <a href="/register" className="text-[#6875F5] font-semibold">Create account</a>
                </p>
            </div>
        </div>
    );
}

// icon eye for show and hide password
function EyeIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.458 12C3.732 7.943 7.523 5 12 5
           c4.477 0 8.268 2.943 9.542 7
           -1.274 4.057-5.065 7-9.542 7
           -4.477 0-8.268-2.943-9.542-7z"
			/>
		</svg>
	);
}

function EyeOffIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M13.875 18.825A10.05 10.05 0 0112 19
           c-4.478 0-8.27-2.944-9.543-7
           a9.97 9.97 0 011.563-3.029"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M6.223 6.223A9.956 9.956 0 0112 5
           c4.477 0 8.268 2.943 9.542 7
           a9.98 9.98 0 01-4.293 5.197"
			/>
			<path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
		</svg>
	);
}
