"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProductModal from "./ProductModal";
import { supabaseClient } from "@/utils/supabase/client";

export default function ProductActions({ product }: any) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure want to delete this product?`)) return;

    setLoading(true);
    try {
      // delete image in database if exist
      if (product.images && product.images.length > 0) {

        // get name file from url
        const filePaths = product.images.map((url: string) => {
          const parts = url.split("product-images/");
          return parts[1]; // get path after bucket
        });

        const { error: storageError } = await supabaseClient.storage
          .from("product-images")
          .remove(filePaths);

        if (storageError) console.error("Failed deleting product images:", storageError);
      }

      // delete product dari db
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product from database");

      toast.success("Product deleted successfully");
      router.refresh();

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">

      {/* button edit */}
      <button
        onClick={() => setIsEditOpen(true)}
        className="p-2 text-gray-500 hover:text-[#6875F5] hover:bg-indigo-50 rounded-lg transition"
        title="Edit Produk"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      </button>

      {/* delete button */}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        title="Hapus Produk"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin inline-block"></span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        )}
      </button>

      {/* modal for edit product */}
      <ProductModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)}
        initialData={product} 
      />
    </div>
  );
}