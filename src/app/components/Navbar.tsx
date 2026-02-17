"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import {
	ShoppingCart,
	LogOut,
	LayoutDashboard,
	User,
	BarChart3,
	History,
    Package
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore"; // set up zustand

export default function Navbar({ user }: { user: any }) {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	// get data items from zustand store
	const cartItems = useCartStore((state) => state.items);
	const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

	const handleLogout = async () => {
		try {
			const res = await fetch("/api/auth/logout", { method: "POST" });
			if (res.ok) {
				toast.success("Logged out successfully");
				setIsOpen(false);
				router.refresh();
				router.push("/login");
			}
		} catch (error) {
			toast.error("Failed to logout");
		}
	};

	return (
		<nav className="bg-white border-b border-[#E5E7EB] px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
			{/* logo brand */}
			<Link href="/" className="flex items-center gap-2 group">
				<div className="w-10 h-10 bg-[#6875F5] rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:rotate-12">
                    L
                </div>
				<span className="hidden sm:block text-[22px] font-black text-[#1F2937] tracking-tight">
					Little<span className="text-[#6875F5]">Grow</span>
				</span>
			</Link>

			{/* right side button actions */}
			<div className="flex items-center gap-3 md:gap-6">
				{/* if the user is logged in => determined role */}
				{user ? (
					<div className="flex items-center gap-4">
						{/* if role customer show cart button */}
						{user.role !== "ADMIN" && (
							<Link
								href="/customer/cart"
								className="relative p-2.5 text-[#1F2937] hover:bg-[#F6F7FB] rounded-full transition-all group"
							>
								<ShoppingCart className="w-6 h-6 group-hover:text-[#6875F5]" />
								{totalItems > 0 && (
									<span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
										{totalItems}
									</span>
								)}
							</Link>
						)}

						{/* dropdown user */}
						<div className="relative">
							<button
								onClick={() => setIsOpen(!isOpen)}
								className="flex items-center gap-2 bg-[#F6F7FB] border border-[#E5E7EB] px-3 py-1.5 rounded-full hover:bg-white transition-all shadow-sm cursor-pointer"
							>
								<div className="w-8 h-8 rounded-full bg-[#6875F5] text-white flex items-center justify-center text-xs font-bold uppercase">
									{user?.name?.[0] || <User size={16} />}
								</div>
								<span className="hidden lg:block text-sm font-semibold text-[#1F2937]">
									{user?.name?.split(" ")[0]}
								</span>
							</button>

							{/* dropdown menu */}
							{isOpen && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setIsOpen(false)}
									></div>
									<div className="absolute right-0 mt-3 w-64 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 ">
										<div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F6F7FB]/50">
											<p className="text-sm font-bold text-[#1F2937]">
												{user?.name}
											</p>
											<p className="text-xs text-[#6B7280] truncate">
												{user?.email}
											</p>
											<div className="mt-2 inline-block px-2 py-0.5 bg-white border border-[#6875F5]/20 text-[#6875F5] text-[10px] font-black rounded-md uppercase tracking-wider">
												{user.role}
											</div>
										</div>

										{/* if user is admin show button and its components, so do customer */}
										<div className="p-1">
											{user.role === "ADMIN" ? (
												<>
													{/* admin menu */}
													<Link
														href="/admin/dashboard"
														className="flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F6F7FB] rounded-xl transition-colors"
														onClick={() => setIsOpen(false)}
													>
														<LayoutDashboard className="w-4 h-4 text-[#6875F5]" />
														Manage Products
													</Link>

													<Link
														href="/admin/analytics"
														className="flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F6F7FB] rounded-xl transition-colors"
														onClick={() => setIsOpen(false)}
													>
														<BarChart3 className="w-4 h-4 text-[#10B981]" />
														Sales Analytics
													</Link>

													<Link
														href="/admin/orders"
														className="flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F6F7FB] rounded-xl transition-colors"
														onClick={() => setIsOpen(false)}
													>
														<History className="w-4 h-4 text-[#F59E0B]" />
														Orders History
													</Link>
												</>
											) : (
												<>
													{/* customer menu */}
													<Link
														href="/customer/cart"
														className="flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F6F7FB] rounded-xl transition-colors"
														onClick={() => setIsOpen(false)}
													>
														<ShoppingCart className="w-4 h-4 text-[#6875F5]" />
														My Shopping Cart
													</Link>

													<Link
														href="/customer/orders"
														className="flex items-center gap-3 px-4 py-3 text-sm text-[#1F2937] hover:bg-[#F6F7FB] rounded-xl transition-colors"
														onClick={() => setIsOpen(false)}
													>
														<Package className="w-4 h-4 text-[#10B981]" />
														My Orders Tracking
													</Link>
												</>
											)}

											<button
												onClick={handleLogout}
												className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors mt-1"
											>
												<LogOut className="w-4 h-4" /> Logout
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				) : (
					/* if user isnt logged in shows regist/login button */
					<div className="flex items-center gap-2">
						{/* cart button redirect to login first */}
						<Link
							href="/login"
							className="p-2.5 text-[#6B7280] hover:text-[#6875F5] transition-colors"
						>
							<ShoppingCart className="w-6 h-6" />
						</Link>
						<div className="h-6 w-[1px] bg-[#E5E7EB] mx-1"></div>
						<Link
							href="/login"
							className="px-5 py-2 text-sm font-bold text-[#6875F5] hover:bg-[#F6F7FB] rounded-full transition-all"
						>
							Login
						</Link>
						<Link
							href="/register"
							className="hidden sm:block px-6 py-2 text-sm font-bold bg-[#6875F5] text-white hover:bg-[#5A67D8] rounded-full shadow-md shadow-blue-100 transition-all active:scale-95"
						>
							Register
						</Link>
					</div>
				)}
			</div>
		</nav>
	);
}
