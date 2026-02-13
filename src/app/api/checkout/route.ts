import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(req: Request) {
    const { amount, items, userId } = await req.json();

    const order = await prisma.order.create({
        data: {
            user_id: userId,
            total_price: amount,
            status: "PENDING",
            order_items: {
                create: items.map((item: any) => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        }
    });

    const parameter = {
        transaction_details: { order_id: order.id, gross_amount: amount },
        item_details: items.map((i: any) => ({ id: i.id, price: i.price, quantity: i.quantity, name: i.name }))
    };

    const token = await snap.createTransactionToken(parameter);

    return NextResponse.json({ token, orderId: order.id });
}