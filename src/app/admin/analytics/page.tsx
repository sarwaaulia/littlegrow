"use client";

import { useEffect, useState, useMemo } from "react";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { format, isWithinInterval, subDays } from "date-fns";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import Navbar from "../../components/Navbar";
import { supabaseClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

interface Order {
	id: string;
	total_price: number | string;
	status: string;
	created_at: string;
	user?: {
		name: string;
		email: string;
		role: string;
	};
	order_items: {
		quantity: number;
		product: {
			name: string;
			category: { name: string } | string;
		};
	}[];
}

export default function AnalyticsDashboard({ user }: { user: any }) {
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [data, setData] = useState<{ orders: Order[] }>({ orders: [] });
	const [loading, setLoading] = useState(true);

	const [timeRange, setTimeRange] = useState("all");
	const [chartType, setChartType] = useState("product");

	useEffect(() => {
		const initializeDashboard = async () => {
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

				const statsRes = await fetch("/api/admin/stats");
				const statsData = await statsRes.json();

				setData(statsData);
			} catch (err) {
				console.error("Initialization error:", err);
				toast.error("Failed to load dashboard data");
			} finally {
				setLoading(false);
			}
		};

		initializeDashboard();
	}, []);

	// filtering data
	const filteredData = useMemo(() => {
		let list = [...data.orders];
		const now = new Date();

		if (timeRange === "7days") {
			list = list.filter((o) =>
				isWithinInterval(new Date(o.created_at), {
					start: subDays(now, 7),
					end: now,
				}),
			);
		} else if (timeRange === "30days") {
			list = list.filter((o) =>
				isWithinInterval(new Date(o.created_at), {
					start: subDays(now, 30),
					end: now,
				}),
			);
		}

		const stats: Record<string, number> = {};
		list.forEach((order) => {
			order.order_items.forEach((item: any) => {
				let key = "Unknown";
				if (chartType === "product") {
					key = item.product.name;
				} else {
					const cat = item.product.category;
					key =
						typeof cat === "object"
							? cat?.name || "Uncategorized"
							: cat || "Uncategorized";
				}
				stats[key] = (stats[key] || 0) + item.quantity;
			});
		});

		return Object.keys(stats).map((name) => ({ name, value: stats[name] }));
	}, [data.orders, timeRange, chartType]);

	const exportToExcel = () => {
		const dataToExport = data.orders.map((o) => ({
			OrderID: o.id,
			Customer: o.user?.name || "Guest",
			Total: Number(o.total_price),
			Status: o.status,
			Date: format(new Date(o.created_at), "yyyy-MM-dd"),
		}));

		const workSheets = XLSX.utils.json_to_sheet(dataToExport);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, workSheets, "Sales_Report");
		XLSX.writeFile(workbook, `Report_${format(new Date(), "yyyyMMdd")}.xlsx`);
	};

	const color = ["#6875F5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

	if (loading)
		return (
			<div className="p-10 text-center font-bold">Loading Analytics...</div>
		);

	return (
		<div className="min-h-screen bg-[#F6F7FB]">
			<Navbar user={currentUser} />
			<main className="p-8 space-y-6 max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<h1 className="text-3xl md:text-3xl text-gray-500 font-bold">
						Sales Dashboard
					</h1>
					<div className="flex flex-wrap gap-2">
						<select
							value={timeRange}
							onChange={(e) => setTimeRange(e.target.value)}
							className="bg-[#FFFF] border border-[#6875F5] px-3 py-2 rounded-xl text-sm font-semibold text-[#1F2937] font-medium shadow-sm outline-none"
						>
							<option value="all">All Time</option>
							<option value="7days">Last 7 Days</option>
							<option value="30days">Last 30 Days</option>
						</select>

						<select
							value={chartType}
							onChange={(e) => setChartType(e.target.value)}
							className="bg-[#FFFF] border border-[#6875F5] px-3 py-2 rounded-xl text-sm font-semibold text-[#1F2937] font-medium shadow-sm outline-none"
						>
							<option value="product">By Product</option>
							<option value="category">By Category</option>
						</select>

						<button
							onClick={exportToExcel}
							className="flex items-center gap-2 bg-[#1F2937] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all"
						>
							<Download size={16} /> Export Excel
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm">
						<h2 className="font-bold text-[#1F2937] mb-4">
							Sold Items Distribution
						</h2>
						<div className="h-[400px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={filteredData}
										cx="50%"
										cy="50%"
										innerRadius={80}
										outerRadius={120}
										paddingAngle={5}
										dataKey="value"
									>
										{filteredData.map((_, index) => (
											<Cell
												key={`cell-${index}`}
												fill={color[index % color.length]}
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: "15px",
											border: "none",
											boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
										}}
									/>
									<Legend verticalAlign="bottom" height={36} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-[#6875F5] p-8 rounded-3xl text-white flex flex-col justify-center">
						<p className="opacity-80 text-sm font-bold uppercase tracking-widest">
							Total Revenue
						</p>
						<h2 className="text-4xl font-black mt-2">
							Rp{" "}
							{data.orders
								.reduce((acc, curr) => acc + Number(curr.total_price), 0)
								.toLocaleString()}
						</h2>
						<div className="mt-8 pt-8 border-t border-white/20">
							<p className="opacity-80 text-sm font-bold uppercase tracking-widest">
								Total Orders
							</p>
							<h2 className="text-4xl font-black mt-2">{data.orders.length}</h2>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
