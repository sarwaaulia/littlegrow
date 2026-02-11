import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
    // suggest for you dari 4 produk terbaru
    const latestProducts = await prisma.product.findMany({
        include: { category: true },
        orderBy: { created_at: 'desc' },
        take: 4
    });

    const categories = [
        { name: 'Clothing', slug: 'clothing', img: '/cat-clothing.jpg' },
        { name: 'Footwear', slug: 'footwear', img: '/cat-footwear.jpg' },
        { name: 'Toys', slug: 'toys', img: '/cat-toys.jpg' },
        { name: 'Accessories', slug: 'accessories', img: '/cat-acc.jpg' },
    ];

    return (
        <main className="bg-[#F6F7FB] min-h-screen">

            {/* jumbotron section */}
            <section className="bg-white border-b border-[#E5E7EB] overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
                    {/* Left: Baby Image */}
                    <div className="w-full md:w-1/2 h-[400px] md:h-[600px] relative">
                        <Image 
                            src="https://images.unsplash.com/photo-1522771917583-6cba89217e68" 
                            alt="Baby" fill className="object-cover" 
                        />
                    </div>

                    {/* cta */}
                    <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col items-start gap-6">
                        <span className="text-[#6875F5] font-black uppercase tracking-tighter text-sm">New Collection 2024</span>
                        <h1 className="text-4xl md:text-6xl font-black text-[#1F2937] leading-tight">
                            Everything Your Little One Needs.
                        </h1>
                        <p className="text-[#6B7280] text-lg max-w-md">
                            From softest organic clothing to educational toys. Shop the curated collection for your baby's growth.
                        </p>
                        <Link href="/products" className="bg-[#6875F5] text-white px-10 py-4 rounded-full font-bold hover:bg-[#5A67D8] transition-all transform hover:scale-105 shadow-lg shadow-blue-200">
                            Shop All Products
                        </Link>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* suggest for you section */}
                <div className="mb-16">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-[#1F2937]">Suggest For You</h2>
                            <p className="text-[#6B7280]">Our latest arrivals just for your baby</p>
                        </div>
                        <Link href="/products" className="text-[#6875F5] font-bold border-b-2 border-[#6875F5] hover:text-[#5A67D8]">View All</Link>
                    </div>
                    <ProductGrid products={latestProducts} />
                </div>

                {/* category card section */}
                <div>
                    <h2 className="text-3xl font-black text-[#1F2937] mb-8 text-center">Shop By Category</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group relative h-80 rounded-2xl overflow-hidden">
                                <Image src={cat.img} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}