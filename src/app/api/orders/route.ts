import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: {
                user_id: user.id,
            },
            include: {
                order_items: {
                    include: {
                        product: true
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Cannot get orders user", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}