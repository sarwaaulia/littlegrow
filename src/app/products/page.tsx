import ProductGrid from "@/app/components/ProductGrid";
import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";

async function getProducts() {
	const products = await prisma.product.findMany({
		include: {
			category: true,
		},
	});
	return products;
}

export default async function ProductsPage() {
	const products = await getProducts();
	return (
		<main className="min-h-screen bg-[#F6F7FB]">
			<div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

				{/* grid produk */}
				<ProductGrid products={products} />
			</div>
		</main>
	);
}
