"use client";

import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import {
	Trash2,
	Plus,
	Minus,
	ArrowLeft,
	ShoppingBag,
	CheckCircle2,
	ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabaseClient } from "@/utils/supabase/client";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";

export default function CartPage() {
	const router = useRouter();
	const { items, removeItem, updateQty, clearCart } = useCartStore();

	const [showInvoice, setShowInvoice] = useState(false);
	const [lastOrder, setLastOrder] = useState<any>(null);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getUser = async () => {
			try {
				const {
					data: { user },
				} = await supabaseClient.auth.getUser();
				if (user) {
					setCurrentUser({
						...user,
						name: user.user_metadata?.name || user.email?.split("@")[0],
						role: user.user_metadata?.role || "USER",
					});
				}
			} catch (error) {
				console.error("Error fetching user:", error);
			} finally {
				setLoading(false);
			}
		};
		getUser();
	}, []);

	// calculate total price
	const subtotal = items.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0,
	);

	const handleCheckout = async () => {
		if (typeof window !== "undefined" && !(window as any).snap) {
			toast.error("loading...");
			return;
		}

		const {
			data: { user },
			error: authError,
		} = await supabaseClient.auth.getUser();

		if (authError || !user) {
			return toast.error(`You must be logged in to checkout the products`);
		}

		if (items.length === 0) return toast.error("cart is empty!");

		try {
			// get token midtrans
			const res = await fetch("/api/checkout", {
				method: "POST",
				body: JSON.stringify({
					amount: subtotal,
					items: items, // items from zustand
					userId: user.id,
				}),
			});

			const orderData = await res.json();

			const orderSummary = {
				orderId: orderData.orderId,
				customerName: user.user_metadata?.name || user.email?.split("@")[0],
				items: [...items],
				total: subtotal,
			};

			// pop up midtrans
			(window as any).snap.pay(orderData.token, {
				onSuccess: async function (result: any) {
					setLastOrder(orderSummary);
					setShowInvoice(true);
					
					if (currentUser?.id) {
						clearCart(currentUser.id);
					}

					await fetch("/api/orders/complete", {
						method: "POST",
						body: JSON.stringify({ orderId: orderData.orderId }),
					});

					toast.success("Payment Successful!");
				},
				onPending: () => toast.loading("Waiting for payment..."),
				onError: () => toast.error("Payment failed!"),
			});
		} catch (error) {
			toast.error("Checkout failed. Please try again.");
			console.error("Checkout error:", error);
		}
	};

	if (items.length === 0) {
		return (
			<div className="min-h-screen bg-[#F6F7FB] flex flex-col items-center justify-center p-6 text-center">
				<div className="bg-white p-10 rounded-3xl shadow-sm flex flex-col items-center">
					<ShoppingBag className="w-18 h-20 text-[#6875F5] mb-6 opacity-20" />
					<h2 className="text-2xl font-bold text-[#1F2937]">
						Your cart is empty
					</h2>
					<p className="text-[#6B7280] mt-2 mb-8">
						You haven't added any products yet.
					</p>
					<Link
						href="/products"
						className="bg-[#6875F5] text-white px-8 py-3 rounded-full font-bold hover:bg-[#5A67D8] transition-all"
					>
						Start Shopping
					</Link>
				</div>
			</div>
		);
	}

	if (loading)
		return (
			<div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
				Loading...
			</div>
		);

	return (
		<div className="min-h-screen bg-[#F6F7FB]">
			<Navbar user={currentUser} />

			<div className="py-12 px-6">
				{/* invoice modal */}
				{showInvoice && lastOrder && (
					<div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
						<div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
							<div className="bg-green-600 p-8 text-center text-white">
								<CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
								<h2 className="text-2xl font-black text-white">
									Payment Success!
								</h2>
							</div>

							<div className="p-8">
								<div className="space-y-4 mb-8 text-slate-900">
									<div className="flex justify-between text-sm">
										<span className="text-slate-500 font-bold">Order ID:</span>
										<span className="font-black">
											{lastOrder.orderId.slice(0, 8)}
										</span>
									</div>
									<div className="flex justify-between text-sm border-t border-dashed pt-4">
										<span className="text-slate-900 font-bold text-lg underline decoration-[#6875F5]">
											Total Paid
										</span>
										<span className="font-black text-2xl text-[#6875F5]">
											Rp{lastOrder.total.toLocaleString()}
										</span>
									</div>
								</div>

								<button
									onClick={() => {
										setShowInvoice(false);
										router.push("/customer/orders");
									}}
									className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
								>
									<span>Track Your Order</span>
									<ArrowRight className="w-5 h-5" />
								</button>
							</div>
						</div>
					</div>
				)}

				<div className="max-w-5xl mx-auto">
					{items.length === 0 && !showInvoice ? (
						<div className="bg-white p-10 rounded-3xl shadow-sm flex flex-col items-center text-center">
							<ShoppingBag className="w-18 h-20 text-[#6875F5] mb-6 opacity-20" />
							<h2 className="text-2xl font-black text-slate-900">
								Your cart is empty
							</h2>
							<Link
								href="/products"
								className="mt-8 bg-[#6875F5] text-white px-8 py-3 rounded-full font-bold"
							>
								Start Shopping
							</Link>
						</div>
					) : (
						<>
							<div className="flex items-center gap-4 mb-8">
								<Link
									href="/products"
									className="p-2 bg-white rounded-full border border-gray-200"
								>
									<ArrowLeft className="w-5 h-5 text-slate-900" />
								</Link>
								<h1 className="text-2xl font-black text-slate-900">
									My Cart{" "}
									<span className="text-slate-500 ml-3">({items.length})</span>
								</h1>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
								<div className="lg:col-span-2 space-y-4">
									{items.map((item) => (
										<div
											key={item.id}
											className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm"
										>
											<div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
												<Image
													src={item.image}
													alt={item.name}
													fill
													className="object-cover"
													unoptimized
												/>
											</div>
											<div className="flex-1">
												<h3 className="font-black text-slate-900 text-lg leading-tight">
													{item.name}
												</h3>
												<p className="text-[#6875F5] font-black mt-1">
													Rp{item.price.toLocaleString("id-ID")}
												</p>
												<div className="flex items-center gap-4 mt-4">
													<div className="flex items-center border-1 border-[#6875F5] rounded-xl outline-none">
														<button
															onClick={() => updateQty(item.id, "minus", currentUser.id)}
															className="p-2 text-slate-900 hover:text-red-500 transition-colors"
														>
															<Minus className="w-4 h-4" />
														</button>
														<span className="px-4 font-black text-slate-900 border-x-2 border-slate-100">
															{item.quantity}
														</span>
														<button
															onClick={() => updateQty(item.id, "plus", currentUser.id)}
															className="p-2 text-slate-900 hover:text-green-500 transition-colors"
														>
															<Plus className="w-4 h-4" />
														</button>
													</div>
													<button
														onClick={() => removeItem(item.id, currentUser.id)}
														className="text-slate-400 hover:text-red-600 transition-colors"
													>
														<Trash2 className="w-5 h-5" />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>

								<div className="lg:col-span-1">
									<div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
										<h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
											Receipt Summary
										</h2>
										<div className="space-y-3 mb-6">
											<div className="flex justify-between text-slate-500 font-bold">
												<span>Subtotal</span>
												<span>Rp{subtotal.toLocaleString("id-ID")}</span>
											</div>
										</div>
										<div className="flex justify-between py-6 border-t-2 border-slate-50">
											<span className="text-l font-bold text-slate-900">
												Total
											</span>
											<span className="text-2xl font-black text-[#6875F5]">
												Rp{subtotal.toLocaleString("id-ID")}
											</span>
										</div>
										<button
											onClick={handleCheckout}
											className="w-full bg-[#6875F5] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#5A67D8] transition-all shadow-lg shadow-[#6875F5]/30 flex items-center justify-center gap-2 group"
										>
											Checkout
										</button>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			<Script
				src="https://app.sandbox.midtrans.com/snap/snap.js"
				data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
				strategy="lazyOnload"
			/>
		</div>
	);
}
