import { NextResponse } from "next/server";
import {prisma} from '@/lib/prisma';
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // verification signature key
        const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
        const stringToHash = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
        const hashed = crypto.createHash('sha512').update(stringToHash).digest('hex');

        if(hashed !== body.signature_key) {
            return NextResponse.json({message: `Invlalid signature`}, {status: 400})
        }

        const transactionStatus = body.status
        const orderId = body.order_id

        // check if payment status success
        if(transactionStatus === 'capture' || transactionStatus === 'settlement') {
            const updateOrder = await prisma.order.update({
                where: {id: orderId},
                data: {status: 'COMPLETED'},
                include: {
                    user: true,
                    order_items: {
                        include: {
                            product: true // get product information
                        }
                    }
                }
            })
            await resend.emails.send({
                from: `LittleGrow test`,
                to: updateOrder.user.email || "",
                subject: `Payment successfull! - Order ID ${orderId}`,
                html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto">
                <h2>Hello ${updateOrder.user?.name}, your payment was successful!</h2>
                        <p>We have received your order and are processing it.</p>
                        <hr/>
                        <h4>Detail Product:</h4>
                        <ul>
                            ${updateOrder.order_items.map(item => `
                                <li>${item.product.name} x ${item.quantity} - Rp ${Number(item.price).toLocaleString()}</li>
                            `).join('')}
                        </ul>
                        <p><strong>Total Payment:</strong> Rp ${Number(updateOrder.total_price).toLocaleString()}</p>
                        <p>Thank you for shopping at LittleGrow. We look forward to your next visit.</p>
                </div>`
            })
        }
        return NextResponse.json({ message: "OK" });
    } catch (error) {
        console.error(`Webhook error`, error)
        return NextResponse.json({message: `Webhook error`}, {status: 500})
    }
}