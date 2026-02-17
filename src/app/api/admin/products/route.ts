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
		if(!body.name || !body.price || !body.categoryName) {
			return NextResponse.json({message: `All data are required`}, {status: 500})
		}
		const product = await prisma.product.create({
			data: {
				name: body.name,
				description: body.description,
				price: parseFloat(body.price),
				stock: parseInt(body.stock),
				images: body.images, // array url from supabase storage

				// category
				category: {
					connectOrCreate: {
						where: { name: body.categoryName }, // by name
						create: { name: body.categoryName }, // if category doenst exist, add it
					},
				},
			},
		});

		return NextResponse.json(product, { status: 201 });
	} catch (error) {
		console.error("PRISMA ERROR:", error);
		return NextResponse.json(
			{ message: `Error creating product` },
			{ status: 500 },
		);
	}
}
