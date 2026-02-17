"use client";

import Image from "next/image";
import { ShoppingCart, Check, Search, Filter } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ProductGrid({
    products: initialProducts,
    categories,
}: any) {
    const [products, setProducts] = useState(initialProducts || []);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [search, setSearch] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null); // State for user login

    const router = useRouter();
    
    // get data and function from zustand
    const items = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, []);

    // realtime listener for update roduct
    useEffect(() => {
        const channel = supabaseClient
            .channel("realtime-products")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "products" },
                (payload) => {
                    console.log("Ada perubahan data!", payload);
                    router.refresh();
                },
            )
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [router]);

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        let result = [...products];

        if (search) {
            const query = search.toLowerCase();
            result = result.filter(
                (p: any) =>
                    p.name?.toLowerCase().includes(query) ||
                    p.category?.name?.toLowerCase().includes(query),
            );
        }

        if (selectedCategory !== "all") {
            result = result.filter((p: any) => p.category?.name === selectedCategory);
        }

        return result.sort((a: any, b: any) => {
            if (sortBy === "price-high") return b.price - a.price;
            if (sortBy === "price-low") return a.price - b.price;
            if (sortBy === "stock-low") return a.stock - b.stock;
            return (
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        });
    }, [products, search, selectedCategory, sortBy]);

    const handleToggleCart = (e: React.MouseEvent, p: any) => {
        e.preventDefault();

        if (!currentUser) {
            return toast.error("Please login to add items to cart", { icon: "🔒" });
        }

        const userId = currentUser.id;
        const isExist = items.find((item) => item.id === p.id && item.userId === userId);

        if (isExist) {
            removeItem(p.id, userId);
            toast.error(`${p.name} removed from cart!`, { icon: "🛒" });
        } else {
            addItem({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images?.[0] || "https://placehold.co/600x400?text=No+Image",
            stock: p.stock,
            quantity: 1, 
            userId: userId,
        }, userId); 
            
            toast.success(`${p.name} added to cart!`, { icon: "🛒" });
        }
    };

    return (
        <div className="space-y-8">
            {/* filtering dan sorting */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm">
                {/* Filter by category */}
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-indigo-50 rounded-xl text-[#6875F5]">
                        <Filter size={20} />
                    </div>
                    <select
                        className="font-bold text-[#1F2937] outline-none bg-transparent cursor-pointer text-sm"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories?.map((cat: any) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* search bar product*/}
                <div className="flex-1 max-w-xl relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search baby essential..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border rounded-2xl py-3 pl-12 pr-4 text-sm text-[#1F2937] font-medium focus:ring-2 focus:ring-indigo-100 outline-none bg-[#FFFF] border border-[#6875F5] transition-all"
                    />
                </div>

                {/* sorting */}
                <div className="flex items-center gap-3 px-2">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sort By:</span>
                    <select
                        className="bg-[#F6F7FB] px-4 py-2 rounded-xl font-bold text-[#1F2937] text-sm outline-none border-none cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="price-high">Highest Price</option>
                        <option value="price-low">Lower Price</option>
                        <option value="stock-low">Low Stock</option>
                    </select>
                </div>
            </div>

            {/* Grid Produk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((p: any) => {
                    // check status for user logged in its cart
                    const isInCart = items.some((item) => item.id === p.id && item.userId === currentUser?.id);
                    
                    return (
                        <Link
                            href={`/products/${p.id}`}
                            key={p.id}
                            className="group bg-white rounded-[2rem] overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-xl hover:shadow-indigo-50/50"
                        >
                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                <Image
                                    src={p.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                                    alt={p.name}
                                    fill
                                    unoptimized
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {p.stock < 5 && p.stock > 0 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
                                        Limited Stock
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <span className="text-[10px] font-black text-[#6875F5] uppercase tracking-widest">
                                    {p.category?.name || "General"}
                                </span>
                                <h3 className="font-bold text-[#1F2937] text-lg line-clamp-1 mt-1 group-hover:text-[#6875F5] transition-colors">
                                    {p.name}
                                </h3>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-xl font-black text-[#1F2937]">
                                        Rp{p.price.toLocaleString()}
                                    </span>
                                </div>

                                <button
                                    onClick={(e) => handleToggleCart(e, p)}
                                    disabled={p.stock <= 0}
                                    className={`w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                        p.stock <= 0
                                            ? "bg-gray-200 text-gray-400"
                                            : isInCart
                                                ? "bg-emerald-500 text-white"
                                                : "bg-[#6875F5] text-white hover:bg-[#5a67d8]"
                                    }`}
                                >
                                    {isInCart ? (
                                        <><Check size={18} /> In Cart</>
                                    ) : (
                                        <><ShoppingCart size={18} /> {p.stock <= 0 ? "Out of Stock" : "Add to Cart"}</>
                                    )}
                                </button>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold italic">Product not found</p>
                </div>
            )}
        </div>
    );
}
