import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import ProductDetailClient from "@/app/components/ProductDetail";
import { createClient } from "@/utils/supabase/server";

export default async function ProductPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	if (!id) notFound();

	const product = await getProduct(id);
	const supabase = await createClient();
	const { data: { user: authUser }} = await supabase.auth.getUser();

	if (!product) notFound();

	return (
		<main className="min-h-screen bg-[#F6F7FB]">
			<Navbar user={authUser} />
			<div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
				<ProductDetailClient product={product} />
			</div>
		</main>
	);
}

async function getProduct(id: string) {
    if (!id) return null;

    const product = await prisma.product.findUnique({
        where: { id: id },
        include: { category: true },
    });

    if (!product) return null;

    return {
        ...product,
        price: Number(product.price),
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString(),
    };
}
