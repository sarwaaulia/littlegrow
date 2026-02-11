"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar({ user }: { user: any }) {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const handleLogout = async () => {
		const res = await fetch("/api/auth/logout", { method: "POST" });
		if (res.ok) {
			toast.success("Logged out");
			router.refresh();
			router.push("/login");
		}
	};

	return (
		<nav className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex justify-between items-center">
			<div className="font-bold text-xl text-[#6875F5]">QuickStore</div>

			{/* Search Bar */}
			<div className="flex-1 max-w-md mx-4">
				<input
					type="text"
					placeholder=""
					className="w-full bg-[#F6F7FB] border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#818CF8] outline-none"
				/>
			</div>

			{/* User Info & Dropdown */}
			<div className="relative">
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center space-x-2 bg-[#F6F7FB] p-2 rounded-lg hover:bg-[#EEF0F5] transition"
				>
					<div className="w-8 h-8 bg-[#6875F5] rounded-full flex items-center justify-center text-white text-xs font-bold">
						{user?.name?.[0]?.toUpperCase() || "U"}
					</div>
					<span className="text-sm font-medium text-[#1F2937]">
						{user?.name}
					</span>
				</button>

				{isOpen && (
					<div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-2 z-50">
						<div className="px-4 py-2 border-b border-[#F3F4F6]">
							<p className="text-sm font-semibold text-[#1F2937]">
								{user?.name}
							</p>
							<p className="text-xs text-[#6B7280]">{user?.email}</p>
						</div>
						<button
							onClick={handleLogout}
							className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
						>
							Logout
						</button>
					</div>
				)}
			</div>
		</nav>
	);
}
