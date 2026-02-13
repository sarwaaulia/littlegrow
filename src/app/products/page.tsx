import ProductGrid from "@/app/components/ProductGrid";
import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import { createClient } from "@/utils/supabase/server";

async function getProductsData() {
	const supabase = await createClient();

	const {
		data: { user: authUser },
	} = await supabase.auth.getUser();
	let userData = null;

	if (authUser) {
		userData = await prisma.user.findUnique({
			where: { id: authUser.id },
		});
	}

	const [products, categories] = await Promise.all([
		prisma.product.findMany({
			include: { category: true },
			orderBy: { created_at: "desc" },
		}),
		prisma.category.findMany(),
	]);

	// parsing pricec decimal dan tanggal format
	const productsInfo = products.map((product) => ({
		...product,
		price: Number(product.price),
		created_at: product.created_at.toISOString(),
		updated_at: product.updated_at.toISOString(),
	}));

	return { userData, productsInfo, categories };
}

export default async function ProductsPage() {
	const { userData, productsInfo, categories } = await getProductsData();

	return (
		<main className="min-h-screen bg-[#F6F7FB]">
			<Navbar user={userData} />

			<div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
				<ProductGrid
					products={productsInfo}
					categories={categories}
				/>
			</div>
		</main>
	);
}
