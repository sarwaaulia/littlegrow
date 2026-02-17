"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { supabaseClient } from "@/utils/supabase/client"; 

export default function ProductDetail({ product }: any) {
    const [quantity, setQuantity] = useState(1);
    const [currentUser, setCurrentUser] = useState<any>(null); // State for user
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, []);

    const increment = () => {
        if (quantity < product.stock) setQuantity((prev) => prev + 1);
    };

    const decrement = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    const handleAddToCart = () => {
        if (product.stock <= 0) return;

        if (!currentUser) {
            return toast.error("Please login to add items to cart", { icon: "🔒" });
        }

        const userId = currentUser.id;

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "https://placehold.co/600x400?text=No+Image",
            quantity: quantity, 
            stock: product.stock,
            userId: userId, 
        }, userId); 

        toast.success(`${product.name} added to cart!`);
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
        document.body.appendChild(script);

        return () => { 
            if (document.body.contains(script)) {
                document.body.removeChild(script); 
            }
        };
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* left side image product*/}
            <div className="lg:col-span-5">
                <div className="sticky top-24 space-y-4">
                    <div className="relative aspect-square bg-white rounded-[1rem] overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                            src={product.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    {/* thumbnail image */}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.images?.map((img: string, i: number) => (
                            <div
                                key={i}
                                className="relative w-15 h-15 rounded-2xl overflow-hidden border-2 border-indigo-500 bg-white flex-shrink-0 cursor-pointer"
                            >
                                <Image
                                    src={img}
                                    alt="thumb"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* center product info */}
            <div className="lg:col-span-4 space-y-6">
                <div>
                    <span className="text-xs font-black text-[#6875F5] uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                        {product.category?.name}
                    </span>
                    <h1 className="text-3xl font-black text-[#1F2937] mt-4 leading-tight">
                        {product.name}
                    </h1>
                    <p className="text-4xl font-black text-[#6875F5] mt-4">
                        Rp{product.price.toLocaleString()}
                    </p>
                </div>

                <div className="h-[1px] bg-gray-200 w-full" />

                <div>
                    <h3 className="font-bold text-[#1F2937] mb-2">Description</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">
                        {product.description || "Tidak ada deskripsi produk."}
                    </p>
                </div>
            </div>

            {/* right side card for counting order items */}
            <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-100/20 sticky top-24 space-y-6">
                    <h3 className="font-black text-[#1F2937]">Set Quantity</h3>

                    {/* quantity counter */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-2xl p-1">
                            <button
                                onClick={decrement}
                                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-10 text-center font-bold text-[#1F2937]">
                                {quantity}
                            </span>
                            <button
                                onClick={increment}
                                className="p-2 hover:bg-gray-50 rounded-xl text-[#6875F5]"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400">
                            Stock: <span className="font-bold text-orange-500">{product.stock}</span>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Subtotal</span>
                            <span className="text-xl font-black text-[#1F2937]">
                                Rp{(product.price * quantity).toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className="w-full bg-[#6875F5] text-white py-3 rounded-[1rem] font-bold flex items-center justify-center gap-2 hover:bg-[#5a67d8] transition-all shadow-lg shadow-indigo-100 disabled:bg-gray-200"
                        >
                            <ShoppingCart size={20} /> Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}