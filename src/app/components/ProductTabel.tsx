// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import ProductActions from "./ProductActions";
// import { Search, Filter } from "lucide-react";

// export default function ProductTable({ products }: any) {
// 	const [searchQuery, setSearchQuery] = useState("");
// 	const [selectedCategory, setSelectedCategory] = useState("All");

// 	const filteredProducts = products.filter((p: any) => {
// 		const matchesSearch = p.name
// 			.toLowerCase()
// 			.includes(searchQuery.toLowerCase());
// 		const matchesCategory =
// 			selectedCategory === "All" || p.category?.name === selectedCategory;
// 		return matchesSearch && matchesCategory;
// 	});

// 	const categories = [
// 		"All",
// 		...new Set(products.map((p: any) => p.category?.name).filter(Boolean)),
// 	];

// 	return (
// 		<div className="space-y-6">
// 			<div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
// 				<div className="relative w-full md:w-96">
// 					<Search
// 						className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
// 						size={18}
// 					/>
// 					<input
// 						type="text"
// 						placeholder="Search product..."
// 						className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#6875F5] transition-all text-sm font-medium"
// 						value={searchQuery}
// 						onChange={(e) => setSearchQuery(e.target.value)}
// 					/>
// 				</div>
// 				<div className="flex items-center gap-3">
// 					<Filter className="text-gray-400" size={18} />
// 					<select
// 						className="bg-gray-50 border-none rounded-2xl px-6 py-2.5 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#6875F5] cursor-pointer"
// 						value={selectedCategory}
// 						onChange={(e) => setSelectedCategory(e.target.value)}
// 					>
// 						{categories.map((cat: any) => (
// 							<option key={cat} value={cat}>
// 								{cat}
// 							</option>
// 						))}
// 					</select>
// 				</div>
// 			</div>

// 			<div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
// 				<table className="w-full text-left">
// 					<thead>
// 						<tr className="bg-gray-50/50 border-b border-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
// 							<th className="px-8 py-5">Product Info</th>
// 							<th className="px-6 py-5">Category</th>
// 							<th className="px-6 py-5">Price</th>
// 							<th className="px-6 py-5">Stock Status</th>
// 							<th className="px-8 py-5 text-right">Actions</th>
// 						</tr>
// 					</thead>
// 					<tbody className="divide-y divide-gray-50">
// 						{filteredProducts.map((p: any) => (
// 							<tr
// 								key={p.id}
// 								className="group hover:bg-[#F6F7FB]/50 transition-all"
// 							>
// 								<td className="px-8 py-4">
// 									<div className="flex items-center gap-4">
// 										<div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
// 											<Image
// 												src={
// 													p.images?.[0] ||
// 													"https://placehold.co/600x400?text=No+Image"
// 												}
// 												alt={p.name}
// 												fill
// 												unoptimized
// 												className="object-cover"
// 											/>
// 										</div>
// 										<div>
// 											<h4 className="font-bold text-[#1F2937] text-sm">
// 												{p.name}
// 											</h4>
// 											<p className="text-[10px] text-gray-400 font-mono tracking-tighter">
// 												ID: {p.id.slice(0, 8)}
// 											</p>
// 										</div>
// 									</div>
// 								</td>
// 								<td className="px-6 py-4">
// 									<span className="text-[10px] font-bold text-[#6875F5] bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
// 										{p.category?.name || "General"}
// 									</span>
// 								</td>
// 								<td className="px-6 py-4">
// 									<span className="font-black text-[#1F2937] text-sm">
// 										Rp{p.price.toLocaleString()}
// 									</span>
// 								</td>
// 								<td className="px-6 py-4">
// 									<span
// 										className={`text-sm font-bold ${Number(p.stock) < 5 ? "text-red-500" : "text-gray-500"}`}
// 									>
// 										{p.stock}
// 									</span>
// 								</td>
// 								<td className="px-8 py-4 text-right">
// 									<ProductActions product={p} />
// 								</td>
// 							</tr>
// 						))}
// 					</tbody>
// 				</table>

// 				{/* Empty State */}
// 				{filteredProducts.length === 0 && (
// 					<div className="p-20 text-center">
// 						<p className="text-gray-400 font-bold">No products found.</p>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// }
