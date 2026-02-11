import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		// protect di api
		const dbUser = await prisma.user.findUnique({ where: { id: user?.id } });
		if (dbUser?.role !== "ADMIN")
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });

		const body = await req.json();
		const product = await prisma.product.create({
			data: {
				name: body.name,
				description: body.description,
				price: parseFloat(body.price),
				stock: parseInt(body.stock),
				images: body.images, // array url dari supabase storage

				// category
				category: {
					connectOrCreate: {
						where: { name: body.categoryName }, // mencari kategori berdasarkan nama
						create: { name: body.categoryName }, // jika kategory belum tersedia, maka buat baru
					},
				},
			},
		});

		return NextResponse.json(product, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ message: `Error creating product` },
			{ status: 500 },
		);
	}
}
