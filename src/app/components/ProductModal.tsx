"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function ProductModal({ isOpen, onClose, initialData }: any) {
	const [loading, setLoading] = useState(false);
	const [preview, setPreview] = useState<string[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const router = useRouter();

	const { register, handleSubmit, reset } = useForm({
		defaultValues: initialData || {
			name: "",
			price: "",
			stock: "",
			description: "",
			categoryName: "",
		},
	});

	useEffect(() => {
		if (isOpen && initialData) {
			reset({
				...initialData,
				categoryName:
					initialData.category?.name || initialData.categoryName || "",
			});
		} else if (isOpen && !initialData) {
			reset({
				name: "",
				price: "",
				stock: "",
				description: "",
				categoryName: "",
			});
			setPreview([]); //reset preview if add a new product
			setSelectedFiles([]);
		}
	}, [initialData, reset, isOpen]);

	// clear preview URL when unmount
	useEffect(() => {
		return () => preview.forEach((url) => URL.revokeObjectURL(url));
	}, [preview]);

	// handler preview
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files);
			setSelectedFiles((prev) => [...prev, ...filesArray]);

			// url preview to view
			const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
			setPreview((prev) => [...prev, ...newPreviews]);
		}
	};

	// delete preview
	const removePreview = (index: number) => {
		setPreview((prev) => prev.filter((_, i) => i !== index));
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUploadImages = async (files: File[]) => {
		const uploadedUrls = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileExt = file.name.split(".").pop();

			// using timestamps to avoid duplicate file names
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
			const filePath = `products/${fileName}`;

			const { data, error } = await supabaseClient.storage
				.from("product-images")
				.upload(filePath, file);

			if (error) {
				console.error("UPLOAD ERROR:", error.message); //debug
				continue;
			}

			if (data) {
				const { data: urlData } = supabaseClient.storage
					.from("product-images")
					.getPublicUrl(filePath);

				console.log("Generated URL:", urlData.publicUrl);
				uploadedUrls.push(urlData.publicUrl);
			}
		}
		return uploadedUrls;
	};

	const onSubmit = async (data: any) => {
		setLoading(true);
		try {
			let imageUrls: string[] = [];

			// if images exist, then add(when edit)
			if (initialData?.images) {
				imageUrls = [...initialData.images];
			}

			// upload new images if exist
			if (selectedFiles.length > 0) {
				const newUrls = await handleUploadImages(selectedFiles);
				if (newUrls && newUrls.length > 0) {
					imageUrls = [...imageUrls, ...newUrls];
				}
			}

			// if images doesnt exist, dont send image to avoid getting a broken image
			if (imageUrls.length === 0) {
				console.log("Warning: No images uploaded");
			}

			const url = initialData
				? `/api/admin/products/${initialData.id}`
				: "/api/admin/products";
			const method = initialData ? "PATCH" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...data,
					images: imageUrls,
					price: parseFloat(data.price),
					stock: parseInt(data.stock),
				}),
			});

			if (!res.ok) throw new Error("Failed to save data");

			toast.success(initialData ? "Product updated!" : "Product added!");

			// reset state dan tutup modal
			setPreview([]);
			setSelectedFiles([]);
			reset();
			router.refresh();
			onClose();
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-[#1F2937]">
			<div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E5E7EB] max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-[#F3F4F6] flex justify-between sticky top-0 bg-white z-10">
					<h2 className="text-xl font-bold">
						{initialData ? "Edit" : "New"} Product
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-red-500"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
					{/* product info */}
					<div>
						<label className="block text-sm font-medium mb-1">
							Product Name
						</label>
						<input
							{...register("name", { required: true })}
							className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6875F5]"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Price</label>
							<input
								type="number"
								{...register("price")}
								className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6875F5]"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Stock</label>
							<input
								type="number"
								{...register("stock")}
								className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6875F5]"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Category</label>
						<input
							{...register("categoryName")}
							className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6875F5]"
						/>
					</div>

					{/* upload image */}
					<div className="space-y-2">
						<label className="block text-sm font-medium">Product Images</label>

						{/* preview */}
						<div className="grid grid-cols-4 gap-2 mb-2">
							{/* if edit product, show images already added */}
							{initialData?.images?.map((url: string, i: number) => (
								<div
									key={i}
									className="relative aspect-square rounded-lg overflow-hidden border"
								>
									<Image
										src={url}
										alt="product"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										priority
										className="object-cover"
									/>
								</div>
							))}

							{/* new preview */}
							{preview.map((url, i) => (
								<div
									key={i}
									className="relative aspect-square rounded-lg overflow-hidden border border-[#6875F5]"
								>
									<Image
										src={url}
										alt="preview"
										fill
										className="object-cover"
									/>
									<button
										type="button"
										onClick={() => removePreview(i)}
										className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
									>
										✕
									</button>
								</div>
							))}
						</div>

						<input
							type="file"
							multiple
							accept="image/*"
							onChange={handleFileChange}
							className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#6875F5]/10 file:text-[#6875F5] hover:file:bg-[#6875F5]/20 cursor-pointer"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">
							Description
						</label>
						<textarea
							{...register("description")}
							rows={3}
							className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#6875F5]"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-[#6875F5] text-white py-3 rounded-xl font-bold hover:bg-[#5A67D8] transition disabled:opacity-50"
					>
						{loading ? "Saving Product..." : "Save Product"}
					</button>
				</form>
			</div>
		</div>
	);
}
