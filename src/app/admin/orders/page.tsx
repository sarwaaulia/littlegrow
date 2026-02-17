"use client";

import Navbar from "@/app/components/Navbar";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabase/client";

export default function OrdersHistory() {
	const [orders, setOrders] = useState([]);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initializeOrdersPage = async () => {
			try {
				setLoading(true);

				const {
					data: { user },
					error: authError,
				} = await supabaseClient.auth.getUser();

				if (authError || !user) {
					toast.error("You must be logged in as Admin");
					return;
				}

				setCurrentUser({
					...user,
					name: user.user_metadata?.name || user.email?.split("@")[0],
					role: user.user_metadata?.role || "ADMIN",
				});

				const res = await fetch("/api/admin/stats");
				const data = await res.json();
				setOrders(data.orders || []);
			} catch (err) {
				console.error("Initialization error:", err);
				toast.error("Failed to load orders");
			} finally {
				setLoading(false);
			}
		};

		initializeOrdersPage();
	}, []);

	const fetchOrderHistory = async () => {
		try {
			const res = await fetch("/api/admin/stats");
			const data = await res.json();
			setOrders(data.orders || []);
		} catch (error) {
			toast.error("Failed to fetch orders");
		}
	};

	useEffect(() => {
		fetchOrderHistory();
	}, []);

	const handleUpdateStatusHistory = async (
		order_id: string,
		newStatus: string,
	) => {
		const res = await fetch(`/api/admin/orders/${order_id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: newStatus }),
		});

		if (res.ok) {
			toast.success(`Order status updated to ${newStatus}`);
			const resFetch = await fetch("/api/admin/stats");
            const dataFetch = await resFetch.json();
            setOrders(dataFetch.orders || []);
		}
	};

	if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

	return (
    <div className="min-h-screen bg-[#F6F7FB]">
        <Navbar user={currentUser} />

        <main className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-black mb-6 text-slate-900">Order History</h1>
            
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-900">Customer</th>
                            <th className="p-4 font-bold text-slate-900">Items Ordered</th>
                            <th className="p-4 font-bold text-slate-900">Total</th>
                            <th className="p-4 font-bold text-slate-900">Status</th>
                            <th className="p-4 font-bold text-slate-900">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length > 0 ? (
                            orders.map((o: any) => (
                                <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">
                                            {o.user?.name || "No Name"}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono">
                                            ID: {o.id.slice(0, 8)}
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {o.order_items?.map((item: any) => (
                                                <div key={item.id} className="text-sm text-slate-700">
                                                    <span className="font-semibold text-slate-900">{item.product.name}</span>
                                                    <span className="ml-1 text-slate-500 font-medium">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="p-4 font-bold text-slate-900">
                                        Rp {Number(o.total_price).toLocaleString("id-ID")}
                                    </td>

                                    <td className="p-4 font-black text-xs">
                                        <span className={
                                            o.status === "COMPLETED" ? "text-green-700" : 
                                            o.status === "CANCELLED" ? "text-red-700" : 
                                            "text-amber-600"
                                        }>
                                            {o.status}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <select
                                            onChange={(e) => handleUpdateStatusHistory(o.id, e.target.value)}
                                            value={o.status}
                                            className="text-sm font-bold border border-gray-300 rounded-lg p-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                                    No orders found in database.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    </div>
);
}
