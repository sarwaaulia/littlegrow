import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const { orderId } = await req.json();

    try {
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { order_items: true }
            });

            if (!order || order.status === "COMPLETED") return;

            // update status order
            await tx.order.update({
                where: { id: orderId },
                data: { status: "COMPLETED" }
            });

            // update stok yang di order
            for (const item of order.order_items) {
                await tx.product.update({
                    where: { id: item.product_id },
                    data: { stock: { decrement: item.quantity } }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Gagal update stok" }, { status: 500 });
    }
}