"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard, ProductType } from "@/components/products/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { RatingBadge } from "@/components/reviews/StarRating";
import toast from "react-hot-toast";
import { ShoppingCart, Heart, Truck, ShieldCheck, RefreshCw, ChevronRight, Minus, Plus, BadgeCheck, Package, MessageCircle, Loader2, AlertCircle } from "lucide-react";
interface Product { id: string; name: string; description: string; price: number; oldPrice: number | null; stock: number; images: string[]; isFeatured: boolean; isActive: boolean; category: { id: string; name: string; slug: string; emoji: string }; seller: { id: string; name: string; image: string | null }; store: { id: string; name: string; logo: string | null; isVerified: boolean } | null; }
export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null); const [related, setRelated] = useState<ProductType[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1); const [selImg, setSelImg] = useState(0); const [activeTab, setActiveTab] = useState<"desc"|"reviews"|"ship">("desc");
  const [avgRating, setAvgRating] = useState(0); const [reviewCount, setReviewCount] = useState(0);
  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/products/${id}`); const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Product not found");
        setProduct(data);
        const rel = await fetch(`/api/products?category=${data.category.slug}&limit=5`); const rd = await rel.json();
        setRelated((rd.products ?? []).filter((p: any) => p.id !== id).slice(0, 4).map((p: any): ProductType => ({ id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, images: p.images ?? [], stock: p.stock, seller: { name: p.seller?.name ?? "" }, category: { name: p.category?.name ?? "" } })));
        const revRes = await fetch(`/api/reviews?productId=${id}`); const revData = await revRes.json();
        if (revRes.ok) { setAvgRating(revData.avg ?? 0); setReviewCount(revData.total ?? 0); }
      } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    }
    load();
  }, [id]);
  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><Loader2 className="w-8 h-8 text-pink animate-spin mx-auto mb-3" /><p className="text-[13px] text-gray-400">Loading product…</p></div></div></div>;
  if (error || !product) return (
    <div className="min-h-screen bg-white"><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><div className="text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-7 h-7 text-red-400" /></div>
      <h2 className="text-[17px] font-extrabold text-gray-700 mb-2">Product not found</h2><p className="text-[13px] text-gray-400 mb-5">{error ?? "This product may have been removed."}</p>
      <Link href="/marketplace" className="text-[13px] font-bold text-pink hover:underline">← Back to Marketplace</Link>
    </div></div></div>
  );
  const wishlisted = isWished(product.id); const storeName = product.store?.name ?? product.seller.name; const isVerified = product.store?.isVerified ?? false;
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;
  function handleCart() { addItem({ id: product!.id, name: product!.name, price: product!.price, oldPrice: product!.oldPrice, seller: storeName, category: product!.category.name, image: product!.images?.[0] }, qty); toast.success(`${product!.name} added to cart!`); }
  function handleWish() { const added = toggle({ id: product!.id, name: product!.name, price: product!.price, oldPrice: product!.oldPrice, seller: storeName, category: product!.category.name, image: product!.images?.[0], stock: product!.stock }); toast.success(added ? "Saved to wishlist" : "Removed from wishlist"); }
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="border-b border-gray-100 bg-gray-50"><div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-1.5 text-[12px] text-gray-400">
        <Link href="/" className="hover:text-pink transition-colors font-medium">Home</Link><ChevronRight className="w-3 h-3" />
        <Link href="/marketplace" className="hover:text-pink transition-colors font-medium">Marketplace</Link><ChevronRight className="w-3 h-3" />
        <Link href={`/marketplace?category=${product.category.slug}`} className="hover:text-pink transition-colors font-medium capitalize">{product.category.name}</Link><ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 font-semibold truncate max-w-[200px]">{product.name}</span>
      </div></div>
      <div className="max-w-[1280px] mx-auto px-5 py-10">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-pale to-blue-50 aspect-square flex items-center justify-center border border-gray-100">
              {product.images?.[selImg] ? <Image src={product.images[selImg]} alt={product.name} fill className="object-cover" priority /> : <div className="text-center"><Package className="w-28 h-28 text-gray-200 mx-auto mb-2" strokeWidth={0.8} /><p className="text-[12px] text-gray-300">No image available</p></div>}
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">{product.isFeatured && <span className="badge-feat">Featured</span>}{discount && <span className="badge-sale">-{discount}%</span>}{product.stock === 0 && <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">Sold Out</span>}</div>
            </div>
            {product.images.length > 1 && <div className="flex gap-3 mt-4">{product.images.map((img, i) => (<button key={i} onClick={() => setSelImg(i)} className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${selImg === i ? "border-pink" : "border-gray-200 hover:border-gray-300"}`}><Image src={img} alt="" width={64} height={64} className="w-full h-full object-cover" /></button>))}</div>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-pink flex items-center justify-center text-white text-xs font-black">{storeName[0]}</div>
              <span className="text-[13px] font-semibold text-gray-500">{storeName}</span>
              {isVerified && <><BadgeCheck className="w-3.5 h-3.5 text-cyan" /><span className="text-[11px] font-bold text-cyan bg-cyan-light px-2 py-0.5 rounded-full">Verified</span></>}
            </div>
            <h1 className="text-[1.7rem] font-extrabold text-gray-800 leading-tight tracking-tight mb-3">{product.name}</h1>
            <div className="mb-4">{reviewCount > 0 ? <RatingBadge avg={avgRating} count={reviewCount} size="md" /> : <span className="text-[13px] text-gray-400">No reviews yet</span>}</div>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-[2rem] font-extrabold text-pink tracking-tight">{formatPrice(product.price)}</span>
              {product.oldPrice && <><span className="text-[15px] text-gray-300 line-through">{formatPrice(product.oldPrice)}</span><span className="text-[12px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Save {discount}%</span></>}
            </div>
            <div className="mb-6">
              <div className="text-[13px] font-bold text-gray-700 mb-2">Quantity</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-[1.5px] border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="w-10 text-center font-bold text-[15px] text-gray-800">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={product.stock === 0} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                </div>
                <span className={`text-[12.5px] font-semibold ${product.stock <= 5 && product.stock > 0 ? "text-amber-500" : product.stock === 0 ? "text-red-400" : "text-gray-400"}`}>{product.stock === 0 ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}</span>
              </div>
            </div>
            <div className="flex gap-3 mb-3">
              <button onClick={handleCart} disabled={product.stock === 0} className="flex-1 flex items-center justify-center gap-2 bg-gradient-pink text-white font-bold text-[14px] py-3.5 rounded-full shadow-pink hover:opacity-90 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"><ShoppingCart className="w-5 h-5" />{product.stock === 0 ? "Out of Stock" : `Add to Cart · ${formatPrice(product.price * qty)}`}</button>
              <button onClick={handleWish} className={`w-14 h-14 rounded-full border-[1.5px] flex items-center justify-center transition-all ${wishlisted ? "border-pink bg-pink-pale" : "border-gray-200 hover:border-pink hover:bg-pink-pale"}`}><Heart className={`w-5 h-5 transition-colors ${wishlisted ? "text-pink fill-pink" : "text-gray-400"}`} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">{[{ icon: Truck, label: "Free Delivery", sub: "Orders over RWF 30K" }, { icon: ShieldCheck, label: "Secure Payment", sub: "100% protected" }, { icon: RefreshCw, label: "Easy Returns", sub: "Within 7 days" }].map(({ icon: Icon, label, sub }) => (<div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center"><Icon className="w-4 h-4 text-pink mx-auto mb-1.5" /><div className="text-[11.5px] font-bold text-gray-700 leading-tight">{label}</div><div className="text-[10px] text-gray-400 mt-0.5">{sub}</div></div>))}</div>
          </div>
        </div>
        <div className="mb-16">
          <div className="flex gap-0 border-b border-gray-200 mb-7">{(["desc","reviews","ship"] as const).map(t => (<button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-3.5 text-[13.5px] font-bold border-b-[2.5px] transition-all ${activeTab === t ? "text-pink border-pink" : "text-gray-400 border-transparent hover:text-gray-600"}`}>{t === "desc" ? "Description" : t === "reviews" ? `Reviews${reviewCount > 0 ? ` (${reviewCount})` : ""}` : "Shipping & Returns"}</button>))}</div>
          {activeTab === "desc" && <div className="max-w-2xl text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>}
          {activeTab === "reviews" && <div className="max-w-2xl"><ReviewSection productId={product.id} productName={product.name} /></div>}
          {activeTab === "ship" && (<div className="max-w-2xl space-y-3">{[{ icon: Truck, title: "Delivery", body: "Same-day delivery in Kigali for orders placed before 12PM. Free on orders over RWF 30,000." }, { icon: RefreshCw, title: "Returns", body: "Easy 7-day returns for unused items in original packaging." }, { icon: ShieldCheck, title: "Buyer Protection", body: "Your payment is held securely until you confirm delivery." }, { icon: MessageCircle, title: "Support", body: "Chat with the seller directly. Our team is available 24/7." }].map(({ icon: Icon, title, body }) => (<div key={title} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5"><div className="w-10 h-10 rounded-xl bg-pink-pale flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-pink" /></div><div><div className="text-[13px] font-bold text-gray-800 mb-1">{title}</div><div className="text-[12.5px] text-gray-500 leading-relaxed">{body}</div></div></div>))}</div>)}
        </div>
        {related.length > 0 && <div><div className="mb-6"><span className="section-label">You May Also Like</span><h2 className="section-title">Related Products</h2></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{related.map(p => <ProductCard key={p.id} product={p} />)}</div></div>}
      </div>
      <Footer />
    </div>
  );
}
