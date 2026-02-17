import {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                order_items: {
                    include: {
                        product: {
                            include: {
                                category: true
                            }
                        }
                    },
                },
            },
            orderBy: {created_at: 'desc'}
        })

        // data for charts
        const salesPerMonth: Record<string, number> = {};
        orders.forEach((order) => {
            const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
            salesPerMonth[month] = (salesPerMonth[month] || 0) + Number(order.total_price);
        });

        const chartData = Object.keys(salesPerMonth).map((month) => ({
            name: month,
            total: salesPerMonth[month]
        }));

        return NextResponse.json({orders, chartData})
    } catch (error) {
        return NextResponse.json({error: `Failed to fetch stats chart`}, {status: 500})
    }
}