import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const {id} = await params;

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user)
			return NextResponse.json({ message: `Unauthorized` }, { status: 201 });

		await prisma.product.delete({
			where: { id: id },
		});

		return NextResponse.json(
			{ message: `Product deleted successfully!` },
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{ message: `Error deleting product` },
			{ status: 500 },
		);
	}
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const updatedProduct = await prisma.product.update({
            where: { id: id },
            data: {
                name: body.name,
                description: body.description,
                price: parseFloat(body.price),
                stock: parseInt(body.stock),
                images: body.images,
                category: {
                    connectOrCreate: {
                        where: { name: body.categoryName },
                        create: { name: body.categoryName },
                    },
                },
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error("PATCH_ERROR:", error);
        return NextResponse.json({ message: "Failed update product" }, { status: 500 });
    }
}
