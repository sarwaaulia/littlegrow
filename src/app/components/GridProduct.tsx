import Image from "next/image";
import ProductActions from "./ProductActions";

export default function ProductGrid({ products }: any) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{products.map((p: any) => (
				<div
					key={p.id}
					className="group bg-white rounded-2xl overflow-hidden transition-all duration-300"
				>
					<div className="relative aspect-square bg-gray-100">
						<Image
							src={p.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
							alt={p.name}
							fill
							unoptimized
							className="object-cover transition-transform duration-500"
						/>
					</div>
					<div className="p-5">
						<div className="flex justify-between items-start mb-4">
							<div>
								<span className="text-[10px] font-bold text-[#6875F5] uppercase tracking-widest">
									{p.category?.name || "General"}
								</span>
								<h3 className="font-bold text-[#1F2937] text-lg line-clamp-1">
									{p.name}
								</h3>
							</div>
						</div>
						<div className="flex justify-between items-end pt-4 border-t border-gray-50">
							<span className="text-xl font-black text-[#1F2937]">
								Rp{p.price.toLocaleString()}
							</span>
							<span
								className={`text-sm font-bold ${Number(p.stock) < 5 ? "text-red-500" : "text-gray-500"}`}
							>
								Stock: {p.stock}
							</span>
						</div>
						<div className="mt-4 border-t pt-2">
							<ProductActions product={p} />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
