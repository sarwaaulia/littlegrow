"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validation";
import { RegisterInput } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	// react hook init
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	// submit handler
	async function onSubmit(data: RegisterInput) {
		setLoading(true);

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || "Register failed");
			}

			toast.success("Registration successfully");
			router.push("/login");

		} catch (error: any) {
			toast.error(error.message || "An error occurred during registration");
			console.error("detail error", error.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#F6F7FB] px-4">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm border border-[#E5E7EB]"
			>
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold text-[#1F2937] text-center">
						Create Account
					</h1>
					<p className="text-sm text-[#6B7280] text-center">
						Register an account
					</p>
				</div>

				<div className="space-y-4">

					{/* name */}
					<div className="space-y-1">
						<input
							{...register("name")}
							type="text"
							placeholder="Name"
							className={`w-full rounded-lg border px-3 py-2 text-[#1F2937] transition focus:outline-none focus:ring-2 
                ${errors.name ? "border-red-500 focus:ring-red-200" : "border-[#E5E7EB] focus:ring-[#818CF8]"}`}
						/>
						{errors.name && (
							<p className="text-xs text-red-500">{errors.name.message}</p>
						)}
					</div>

					{/* email */}
					<div className="space-y-1">
						<input
							{...register("email")}
							type="email"
							placeholder="john@gmail.com"
							className={`w-full rounded-lg border px-3 py-2 text-[#1F2937] transition focus:outline-none focus:ring-2 
                ${errors.email ? "border-red-500 focus:ring-red-200" : "border-[#E5E7EB] focus:ring-[#818CF8]"}`}
						/>
						{errors.email && (
							<p className="text-xs text-red-500">{errors.email.message}</p>
						)}
					</div>

					{/* password */}
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
								className="absolute inset-y-0 right-3 flex items-center text-[#9CA3AF] hover:text-[#6875F5] transition"
							>
								{showPassword ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						</div>
						{errors.password && (
							<p className="text-xs text-red-500">{errors.password.message}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg bg-[#6875F5] py-2 text-white font-medium hover:bg-[#5A67D8] transition disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{loading ? "Loading..." : "Register"}
					</button>

					<p className="text-center text-sm text-[#6B7280]">
						Already have an account?{" "}
						<a href="/login" className="text-[#6875F5] font-semibold">
							Login here
						</a>
					</p>
				</div>
			</form>
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
