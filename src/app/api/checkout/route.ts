import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const midtransClient = require("midtrans-client");

const resend = new Resend(process.env.RESEND_API_KEY);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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
					price: item.price,
				})),
			},
		},
		include: {
			user: true,
		},
	});

	try {
		await resend.emails.send({
			from: "LittleGrow <onboarding@resend.dev>", 
			to: "sarwaaulia01@gmail.com", //
			subject: ` ${order.user?.name || "Customer"}`,
			html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2>New order coming in!</h2>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Customer:</strong> ${order.user?.name} (${order.user?.email})</p>
                    <hr />
                    <h3>Detail Product:</h3>
                    <ul>
                        ${items.map((i: any) => `<li>${i.name} x ${i.quantity} - Rp ${Number(i.price).toLocaleString()}</li>`).join("")}
                    </ul>
                    <p><strong>Total Payment:</strong> Rp ${Number(amount).toLocaleString()}</p>
                    <p>Status now: <strong>PENDING</strong> (waiting midtrans payment)</p>
                    <br />
                    <a href="${baseUrl}/admin/orders" style="background: #6875F5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Check Admin Dashboard</a>
                </div>
            `,
		});
	} catch (error) {
		console.error("Failed sending email:", error);
	}

	const parameter = {
		transaction_details: { order_id: order.id, gross_amount: amount },
		item_details: items.map((i: any) => ({
			id: i.id,
			price: i.price,
			quantity: i.quantity,
			name: i.name,
		})),
	};

	const token = await snap.createTransactionToken(parameter);

	return NextResponse.json({ token, orderId: order.id });
}
