"use client";

import Image from "next/image";
import { ShoppingCart, Check, Search, Filter } from "lucide-react";
import { useCartStore } from "@/store/useCartStore"; 
import toast from "react-hot-toast";

export default function ProductGrid({ products }: any) {
	const items = useCartStore((state) => state.items);
	const addItem = useCartStore((state) => state.addItem);
	const removeItem = useCartStore((state) => state.removeItem);

	// optimistic count toggle cart
	const handleToggleCart = (p: any) => {
		const isExist = items.find((item) => item.id === p.id);

		if (isExist) {
			// jika sudah ada di cart maka unklik button
			removeItem(p.id);
			toast.error(`${p.name} Deleted from your cart`);
		} else {
			// jika belom ada di cart maka klik button
			addItem({
				id: p.id,
				name: p.name,
				price: p.price,
				image: p.images?.[0],
				quantity: 1,
				stock: p.stock,
			});
			toast.success(`${p.name} Added to cart!`, {
				icon: "🛒",
			});
		}
	};

	return (
		<div className="space-y-8">

			{/* product grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{products.map((p: any) => {

					// cek apakah produk ini sudah ada di cart
					const isInCart = items.some((item) => item.id === p.id);
					return (
						<div
							key={p.id}
							className="group bg-white rounded-[2rem] overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-xl hover:shadow-indigo-50/50"
						>
							<div className="relative aspect-square bg-gray-100 overflow-hidden">
								<Image
									src={
										p.images?.[0] ||
										"https://placehold.co/600x400?text=No+Image"
									}
									alt={p.name}
									fill
									unoptimized
									className="object-cover transition-transform duration-700 group-hover:scale-110"
								/>

								{/* badge stok hampir habis */}
								{p.stock < 5 && p.stock > 0 && (
									<div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
										LIMIT STOK: {p.stock}
									</div>
								)}
							</div>

							<div className="p-6">
								<span className="text-[10px] font-black text-[#6875F5] uppercase tracking-widest">
									{p.category?.name || "General"}
								</span>
								<h3 className="font-bold text-[#1F2937] text-lg line-clamp-1 mt-1">
									{p.name}
								</h3>

								<div className="flex justify-between items-center mt-4">
									<span className="text-xl font-black text-[#1F2937]">
										Rp{p.price.toLocaleString()}
									</span>
								</div>

								{/* toggle button */}
								<button
									onClick={() => handleToggleCart(p)}
									disabled={p.stock <= 0}
									className={`w-full mt-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
										p.stock <= 0
											? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
											: isInCart
												? "bg-emerald-500 text-white shadow-emerald-100" // warna saat sudah diklik
												: "bg-[#6875F5] text-white shadow-indigo-100" // warna saat belum diklik
									}`}
								>
									{isInCart ? (
										<>
											{" "}
											<Check size={18} /> In Cart{" "}
										</>
									) : (
										<>
											{" "}
											<ShoppingCart size={18} />{" "}
											{p.stock <= 0 ? "Out of Stock" : "Add to Cart"}{" "}
										</>
									)}
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty State */}
			{products.length === 0 && (
				<div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
					<p className="text-gray-400 font-bold italic">
						not found
					</p>
				</div>
			)}
		</div>
	);
}
