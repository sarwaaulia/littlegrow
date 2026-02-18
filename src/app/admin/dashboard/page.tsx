import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import ProductManagement from "@/app/components/ProductManagement";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/login");

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
	});

	if (dbUser?.role !== "ADMIN") redirect("/");

	const [products, categories] = await Promise.all([
        prisma.product.findMany({
            include: { category: true },
            orderBy: { created_at: "desc" },
        }),
        prisma.category.findMany(), // <--- Ambil data ini
    ]);

	const formattedProducts = products.map(p => ({
        ...p,
        price: Number(p.price),
        created_at: p.created_at.toISOString(),
    }));

	return (
		<div className="min-h-screen bg-[#FAF7FF]">
			<Navbar user={dbUser} />

			<main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
				{/* header page */}
				<header className="mb-6">
					<h1 className="text-3xl md:text-3xl text-gray-500 font-bold">
						My Dashboard
					</h1>
					<p className="mt-1 text-sm md:text-base text-[#6B7280] font-semibold">
						Manage your products
					</p>
				</header>

				{/* product management */}
				<section className="bg-white rounded-2xl border border-[#E9D5FF] shadow-sm p-4 md:p-6">
					<ProductManagement
						initialProducts={JSON.parse(JSON.stringify(products))}
						categories={categories}
					/>
				</section>
			</main>
		</div>
	);
}
