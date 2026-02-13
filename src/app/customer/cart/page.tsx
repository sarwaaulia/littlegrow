"use client";

import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { supabaseClient } from "@/utils/supabase/client";
import Script from "next/script";

export default function CartPage() {
	const { items, removeItem, updateQty, clearCart } = useCartStore();

	// menghitung total harga
	const subtotal = items.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0,
	);

	// Di dalam CartPage.tsx
	const handleCheckout = async () => {
		if (typeof window !== "undefined" && !(window as any).snap) {
			toast.error('loading...');
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
			// ambil token midtrans
			const res = await fetch("/api/checkout", {
				method: "POST",
				body: JSON.stringify({
					amount: subtotal,
					items: items, //item dari zustand
					userId: user.id,
				}),
			});

			const { token, orderId } = await res.json();

			// pop up midtrans
			(window as any).snap.pay(token, {
				onSuccess: async function (result: any) {
					toast.success("Payment successfuly!");

					// update stok dan status order
					await fetch("/api/orders/complete", {
						method: "POST",
						body: JSON.stringify({ orderId: orderId }),
					});

					clearCart();
					// router.push('/success'); // redirect
				},
				onPending: () => toast.loading("Payment pending..."),
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

	return (
		<div className="min-h-screen bg-[#F6F7FB] py-12 px-6">
			<div className="max-w-5xl mx-auto">
				<div className="flex items-center gap-4 mb-8">
					<Link
						href="/products"
						className="p-2 bg-white rounded-full hover:bg-gray-100 border border-[#E5E7EB]"
					>
						<ArrowLeft className="w-5 h-5 text-[#1F2937]" />
					</Link>
					<h1 className="text-3xl font-black text-[#1F2937]">
						My Cart ({items.length})
					</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* List Items */}
					<div className="lg:col-span-2 space-y-4">
						{items.map((item) => (
							<div
								key={item.id}
								className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-center gap-4 shadow-sm"
							>
								<div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
									<Image
										src={item.image}
										alt={item.name}
										fill
										className="object-cover"
										unoptimized
									/>
								</div>

								<div className="flex-1">
									<h3 className="font-bold text-[#1F2937]">{item.name}</h3>
									<p className="text-[#6875F5] font-black text-sm mt-1">
										Rp{item.price.toLocaleString("id-ID")}
									</p>

									<div className="flex items-center gap-4 mt-3">
										<div className="flex items-center border border-[#E5E7EB] rounded-lg">
											<button
												onClick={() => updateQty(item.id, "minus")}
												className="p-1 hover:bg-[#F6F7FB]"
											>
												<Minus className="w-4 h-4" />
											</button>
											<span className="px-4 font-bold text-sm">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQty(item.id, "plus")}
												className="p-1 hover:bg-[#F6F7FB]"
											>
												<Plus className="w-4 h-4" />
											</button>
										</div>
										<button
											onClick={() => removeItem(item.id)}
											className="text-red-400 hover:text-red-600 p-2"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Summary Card */}
					<div className="lg:col-span-1">
						<div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm sticky top-24">
							<h2 className="text-lg font-bold text-[#1F2937] mb-6">
								Receipt Summary
							</h2>

							<div className="space-y-3 pb-6 border-b border-[#E5E7EB]">
								<div className="flex justify-between text-[#6B7280]">
									<span>Subtotal</span>
									<span>Rp{subtotal.toLocaleString("id-ID")}</span>
								</div>
							</div>

							<div className="flex justify-between py-6">
								<span className="text-lg font-bold text-[#1F2937]">Total</span>
								<span className="text-2xl font-black text-[#6875F5]">
									Rp{subtotal.toLocaleString("id-ID")}
								</span>
							</div>

							<button
								onClick={handleCheckout}
								className="w-full bg-[#6875F5] text-white py-3 rounded-xl font-bold hover:bg-[#5A67D8] transition-all shadow-lg shadow-blue-100"
							>
								Checkout
							</button>
						</div>
					</div>
				</div>
			</div>
			<Script
				src="https://app.sandbox.midtrans.com/snap/snap.js"
				data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
				strategy="afterInteractive"
			/>
		</div>
	);
}
