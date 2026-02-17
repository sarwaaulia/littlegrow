import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const { status } = await req.json();

		// =update status in db
		const updatedOrder = await prisma.order.update({
			where: { id: id },
			data: { status: status },
			include: {
				user: true,
				order_items: {
					include: { product: true },
				},
			},
		});

        // if admin change status in db to cancelled
		if (status === "CANCELLED") {
			await resend.emails.send({
				from: "LittleGrow Admin <onboarding@resend.dev>",
				to: process.env.ADMIN_EMAIL || "sarwaaulia01@gmail.com", 
				subject: `Cancellation Confirmed - Order #${id.slice(0, 8)}`,
				html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #d32f2f;">Order Successfully Cancelled</h2>
                        <p>Order <strong>#${id}</strong> has been officially cancelled by the system/admin.</p>
                        <hr/>
                        <p><strong>Customer:</strong> ${updatedOrder.user.name} (${updatedOrder.user.email})</p>
                        <p><strong>Total Refund Amount:</strong> Rp ${Number(updatedOrder.total_price).toLocaleString()}</p>
                        <p><strong>Items:</strong></p>
                        <ul>
                            ${updatedOrder.order_items
															.map(
																(item) => `
                                <li>${item.product.name} x ${item.quantity}</li>
                            `,
															)
															.join("")}
                        </ul>
                        <p style="font-size: 12px; color: #666;">This is an automated confirmation for your records.</p>
                    </div>
                `,
			});
		}

		return NextResponse.json(updatedOrder);
	} catch (error) {
		console.error("Update Order Error:", error);
		return NextResponse.json(
			{ error: "Failed to update order" },
			{ status: 500 },
		);
	}
}
