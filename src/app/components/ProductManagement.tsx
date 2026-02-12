"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/utils/supabase/client";
import ProductGrid from "./GridProduct";
import ProductModal from "./ProductModal";
import { useRouter } from "next/navigation";

export default function ProductManagement({ initialProducts }: any) {
	const [products, setProducts] = useState(initialProducts);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("latest");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("all");
	const router = useRouter();

	const categories = ["Clothing", "Footwear", "Accessories", "Toys"];

	// setup realtime subscription
	useEffect(() => {
		const channel = supabaseClient
			.channel("admin-realtime")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "products" },
				(payload: any) => {
					console.log(`berhasil relatime update`, payload);
					router.refresh();

					// update state lokal/optimistic update
					if (payload.eventType === "UPDATE") {
						setProducts((prev: any) =>
							prev.map((p: any) =>
								p.id === payload.new.id ? { ...p, ...payload.new } : p,
							),
						);
					} else if (payload.eventType === "INSERT") {
						setProducts((prev: any) => [payload.new, ...prev]);

					} else if (payload.eventType === "DELETE") {
						setProducts((prev: any) =>
							prev.filter((p: any) => p.id !== payload.old.id),
						);
					}
				},
			)
			.subscribe();

		return () => {
			supabaseClient.removeChannel(channel);
		};
	}, [router]);

	// filtering dan sorting logic
	const filtered = products
		.filter( (p: any) => {
			// match search nama/category
			const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
				p.category?.name.toLowerCase().includes(search.toLowerCase());

			const matchesCategory = selectedCategory === "all" || p.category?.name === selectedCategory;
			return matchesSearch && matchesCategory;
		})

		.sort((a: any, b: any) => {
			if (sortBy === "price-high") return b.price - a.price;
			if (sortBy === "price-low") return a.price - b.price;
			if (sortBy === "stock-low") return a.stock - b.stock;
			// default newest
			return (
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
		});

	return (
		<div className="space-y-6">

			{/* search & action Bar */}
			<div className=" flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				
				{/* Search + Sort */}
				<div className="flex gap-3 w-full md:w-auto">
					<input 
          type="text" 
          placeholder="Search products..." 
          className="
          w-full md:w-64
          bg-[#FFFF] border border-[#6875F5]
          text-[#1F2937]
          placeholder-[#6B7280]
          px-4 py-2
          rounded-xl
          text-sm
          font-semibold
          focus:ring-2 focus:ring-[#A78BFA]
          outline-none"
						onChange={(e) => setSearch(e.target.value)}
					/>

					{/* dropdown category */}
					<select className=" w-44 bg-[#FFFF] border border-[#6875F5] rounded-xl px-3 py-2 text-sm font-semibold text-[#1F2937] outline-none"
						onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
						<option value="all">All Categories</option>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>

					<select 
                        className="bg-[#FFFF] border border-[#6875F5] rounded-xl px-3 py-2 text-sm font-semibold text-[#1F2937] outline-none cursor-pointer"
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="latest">Newest</option>
                        <option value="price-high">Highest Price</option>
                        <option value="price-low">Lowest Price</option>
                        <option value="stock-low">Low Stock</option>
                    </select>
				</div>

				{/* action add button */}
				<button
					onClick={() => setIsModalOpen(true)}
					className=" rounded-lg bg-[#6875F5] hover:bg-[#5A67D8] text-white px-5 py-2 rounded-xl text-sm font-bold transition active:scale-95 w-full md:w-auto">
					+ Add Product
				</button>
			</div>

		{filtered.length > 0 ? (
			<ProductGrid products={filtered} />
		): (
			<div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium text-lg italic">
                        "{search}" not found
                    </p>
                    <button 
                        onClick={() => {setSearch(""); setSelectedCategory("all")}}
                        className="mt-2 text-[#6875F5] text-sm font-semibold underline"
                    >
                        Clear filters
                    </button>
                </div>
		)}	

			<ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	);
}
