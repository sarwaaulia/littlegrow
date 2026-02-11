"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

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
			{/* logo */}
			<Link href={""} className="flex items-center gap-2">
				<div className="w-14 h-14 flex items-center justify-center overflow-hidden">
				</div>
				<span className="hidden sm:block text-[20px] font-semibold text-[#6875F5]">
					LittleGrow
				</span>
			</Link>

			{/* Search Bar in desktop */}
			<div className="hidden flex-1 md:block max-w-md mx-6">
				<input
					type="text"
					placeholder="Search products..."
					className="w-full bg-[#F6F7FB] border-none rounded-full px-4 py-2 text-sm text-gray-500 focus:ring-2 focus:ring-[#818CF8] outline-none"
				/>
			</div>

			{/* dropdown */}
			<div className="relative">
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center gap-2 bg-[#F6F7FB] px-3 py-2 rounded-lg"
				>
					<div className="w-8 h-8 rounded-full bg-[#6875F5] text-white flex items-center justify-center text-xs font-bold">
						{user?.name?.[0]?.toUpperCase()}
					</div>
					<span className="hidden sm:block text-sm text-[#1F2937]">
						{user?.name}
					</span>
				</button>

				{/* user info */}
				{isOpen && (
					<div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg z-50">
						<div className="px-4 py-2 border-b">
							<p className="text-sm font-semibold text-[#6875F5]">
								{user?.name}
							</p>
							<p className="text-xs text-gray-500">{user?.email}</p>
							<p className="text-xs mt-1 text-[#6875F5] capitalize">
								Role: {user?.role}
							</p>
						</div>

						{/* role user */}
						{user?.role === "ADMIN" && (
							<Link
								href="/admin/dashboard"
								className="block px-4 py-2 text-sm text-gray-500 hover:bg-[#F6F7FB]"
							>
								Admin Dashboard
							</Link>
						)}

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


