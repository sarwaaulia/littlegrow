"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { supabaseClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function TrackingOrderCustomer() {
	const [orders, setOrders] = useState<any[]>([]);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const fetchOrders = async (userId: string) => {
		try {
			const res = await fetch(`/api/orders`);
			if (!res.ok) throw new Error("Failed to fetch data order");
			const orderData = await res.json();
			setOrders(orderData);
		} catch (err) {
			console.error("Error fetching orders:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const initialize = async () => {
			const {
				data: { user },
			} = await supabaseClient.auth.getUser();
			if (user) {
				const userData = {
					...user,
					name: user.user_metadata?.name || user.email?.split("@")[0],
					role: user.user_metadata?.role || "CUSTOMER",
				};
				setCurrentUser(userData);
				await fetchOrders(user.id);
			}
		};

		initialize();
	}, []);

    useEffect(() => {
        if (!currentUser) return;

        // channel for listen for change to order data
        const channel = supabaseClient
            .channel('order_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // listening for insert, update and delete data
                    schema: 'public',
                    table: 'Order',
                    filter: `user_id=eq.${currentUser.id}` // just listen to user already logged in
                },
                (payload) => {
                    console.log('Realtime update diterima:', payload);

                    if (payload.eventType === 'INSERT') {
                        // if customer order new product, put the new data on the top of lists
                        fetchOrders(currentUser.id);
                        toast.success("Ada pesanan baru masuk!");
                    } 
                    
                    if (payload.eventType === 'UPDATE') {
                        // if status change
                        setOrders((prev) =>
                            prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
                        );
                        toast("Order status has been updated", { icon: '🔔' });
                    }
                }
            )
            .subscribe();

        // clear if move another page
        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [currentUser]);

	const handleCancelOrder = async (orderId: string) => {
		if (!confirm("Are you sure want to cancel the order?")) return;
		const loadingToast = toast.loading("Canceling order...");
		try {
			const res = await fetch("/api/orders/cancellation", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orderId }),
			});
			if (!res.ok) throw new Error();
			toast.success("Order canceled", { id: loadingToast });
			setOrders(
				orders.map((o) =>
					o.id === orderId ? { ...o, status: "CANCELLED" } : o,
				),
			);
		} catch (error) {
			toast.error("Failed to cancel order", { id: loadingToast });
		}
	};

	if (loading)
		return (
			<div className="p-20 text-center font-semibold text-gray-700">
				Loading...
			</div>
		);

	return (
		<div className="min-h-screen bg-[#F9FAFB]">
			<Navbar user={currentUser} />

			<main className="max-w-3xl mx-auto p-6">
				<div className="mb-8">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Order History
					</h2>
					<p className="text-gray-600 ">
						Check your product order status on LittleGrow.
					</p>
				</div>

				{orders.length === 0 ? (
					<div className="bg-white p-10 rounded-2xl text-center border shadow-sm">
						<p className="text-gray-500 font-medium">No order history yet.</p>
					</div>
				) : (
					<div className="flex flex-col gap-6">
						{orders.map((order) => (
							<div
								key={order.id}
								className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
							>
								<div className="px-5 py-4 bg-white border-b border-gray-100 flex justify-between items-center">
									<span className="font-bold text-gray-900 tracking-tight">
										Order ID:{" "}
										<span className="text-blue-600">
											{order.id.slice(0, 8).toUpperCase()}
										</span>
									</span>
									<span
										className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ${
											order.status === "SUCCESS"
												? "bg-green-100 text-green-700"
												: order.status === "CANCELLED"
													? "bg-red-100 text-red-700"
													: "bg-blue-100 text-blue-700"
										}`}
									>
										{order.status}
									</span>
								</div>

								<div className="p-0">
									<table className="w-full text-left border-collapse">
										<thead>
											<tr className="bg-gray-50/50 text-[11px] uppercase text-gray-400 font-bold">
												<th className="px-5 py-2">Product</th>
												<th className="px-5 py-2 text-center">Quantity</th>
												<th className="px-5 py-2 text-right">Price</th>
											</tr>
										</thead>
										<tbody>
											{order.order_items.map((item: any) => (
												<tr
													key={item.id}
													className="border-b border-gray-50 last:border-none"
												>
													<td className="px-5 py-4">
														<div className="flex items-center gap-3">
															<img
																src={
																	item.product.images?.[0] || item.product.image
																}
																className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-sm"
																alt={item.product.name}
															/>
															<span className="font-bold text-gray-800 text-sm leading-tight">
																{item.product.name}
															</span>
														</div>
													</td>
													<td className="px-5 py-4 text-center">
														<span className="inline-block bg-gray-100 text-gray-900 font-black text-xs px-2 py-1 rounded">
															{item.quantity}x
														</span>
													</td>
													<td className="px-5 py-4 text-right">
														<span className="text-sm font-bold text-gray-900">
															Rp{" "}
															{Number(
																item.price || item.product.price,
															).toLocaleString()}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="px-5 py-4 bg-gray-50/50 flex justify-between items-center">
									<div className="flex flex-col">
										<span className="text-[10px] text-gray-400 font-bold uppercase">
											Total Payment
										</span>
										<span className="text-lg font-black text-gray-900">
											Rp {Number(order.total_price).toLocaleString()}
										</span>
									</div>

									{order.status === "PENDING" && (
										<button
											onClick={() => handleCancelOrder(order.id)}
											className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
										>
											Cancel Order
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
