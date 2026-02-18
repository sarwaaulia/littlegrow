import { NextResponse } from "next/server";
import {prisma} from '@/lib/prisma'
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function PATCH(req: Request){
    try {
        const {orderId} = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // update cancel order
        const orderCanceled = await prisma.order.update({
            where: {id: orderId},
            data: {status: 'CANCELLED'},
            include: {user: true}
        })

        // trigger email to admin
        await resend.emails.send({
            from: `LittleGrow <onboarding@resend.dev>`,
            to: `sarwaaulia01@gmail.com`,
            subject: `Order canceled - ${orderCanceled.user.name}`,
            html: `<p>Customer <b>${orderCanceled.user?.name}</b> just canceled order ID: ${orderId}.</p>`
        })

        return NextResponse.json({message: `The order finally canceled`})
    } catch (error) {
        return NextResponse.json({error: `Failed to cancel order cause error`}, {status: 500})
    }
}