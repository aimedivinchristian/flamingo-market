"use client";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag, Star } from "lucide-react";
export default function WishlistPage() {
  const { items, removeItem, clear, count } = useWishlist();
  const { addItem, isInCart } = useCart();
  function moveToCart(item: typeof items[0]) { addItem({ id: item.id, name: item.name, price: item.price, oldPrice: item.oldPrice, seller: item.seller, category: item.category, image: item.image }); removeItem(item.id); toast.success(`${item.name} moved to cart`); }
  function moveAllToCart() { items.forEach(item => addItem({ id: item.id, name: item.name, price: item.price, oldPrice: item.oldPrice, seller: item.seller, category: item.category, image: item.image })); clear(); toast.success(`${count()} items moved to cart!`); }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-7">
          <div><h1 className="text-[1.7rem] font-extrabold text-gray-800 tracking-tight flex items-center gap-3"><Heart className="w-7 h-7 text-pink fill-pink" />My Wishlist</h1><p className="text-gray-400 text-sm mt-1">{count() === 0 ? "No saved items yet" : `${count()} saved item${count() !== 1 ? "s" : ""}`}</p></div>
          {items.length > 0 && <div className="flex gap-3"><button onClick={() => { if (confirm("Clear your entire wishlist?")) clear(); }} className="text-[13px] font-semibold text-gray-400 border border-gray-200 px-4 py-2 rounded-full hover:border-red-300 hover:text-red-400 transition-all flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Clear all</button><button onClick={moveAllToCart} className="text-[13px] font-bold text-white bg-gradient-pink px-5 py-2 rounded-full shadow-pink hover:opacity-90 transition-all flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" /> Move all to cart</button></div>}
        </div>
        {items.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-20 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-20 h-20 bg-pink-pale border-2 border-pink-pale2 rounded-3xl flex items-center justify-center mx-auto mb-6"><Heart className="w-9 h-9 text-pink" strokeWidth={1.5} /></div>
            <h2 className="text-[1.3rem] font-extrabold text-gray-800 mb-2">Nothing saved yet</h2>
            <p className="text-gray-400 text-[13.5px] mb-7 max-w-sm mx-auto leading-relaxed">Tap the heart on any product to save it here.</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-gradient-pink text-white text-[13.5px] font-bold px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><ShoppingBag className="w-4 h-4" /> Browse Marketplace<ArrowRight className="w-4 h-4" /></Link>
          </div>
        )}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => {
              const inCart = isInCart(item.id);
              const discount = item.oldPrice ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : null;
              return (
                <div key={item.id} className="bg-white border-[1.5px] border-gray-200 rounded-2xl overflow-hidden hover:border-pink-pale2 hover:shadow-card hover:-translate-y-1 transition-all duration-250 group">
                  <Link href={`/product/${item.id}`}>
                    <div className="relative h-48 bg-gradient-to-br from-pink-pale to-blue-50 flex items-center justify-center overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <ShoppingBag className="w-16 h-16 text-gray-200" strokeWidth={0.8} />}
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">{discount && <span className="badge-sale">-{discount}%</span>}{item.stock === 0 && <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">Sold Out</span>}</div>
                      <button onClick={e => { e.preventDefault(); removeItem(item.id); toast.success("Removed from wishlist"); }} className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full border-[1.5px] border-gray-200 flex items-center justify-center shadow hover:border-red-300 hover:bg-red-50 transition-all"><Heart className="w-3.5 h-3.5 text-pink fill-pink" /></button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="text-[11px] text-gray-400 font-medium mb-0.5 truncate">{item.seller}</div>
                    <Link href={`/product/${item.id}`}><div className="text-[13.5px] font-bold text-gray-800 mb-2 line-clamp-2 leading-snug hover:text-pink transition-colors">{item.name}</div></Link>
                    <div className="flex items-center justify-between mb-3"><div className="flex items-baseline gap-1.5"><span className="text-[15px] font-extrabold text-pink">{formatPrice(item.price)}</span>{item.oldPrice && <span className="text-[11.5px] text-gray-300 line-through">{formatPrice(item.oldPrice)}</span>}</div>{item.rating && <div className="flex items-center gap-1 text-[11.5px] text-gray-400"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{item.rating}</div>}</div>
                    <div className="flex gap-2">
                      <button onClick={() => moveToCart(item)} disabled={item.stock === 0 || inCart} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12.5px] font-bold transition-all ${inCart ? "bg-green-50 text-green-600 border border-green-200 cursor-default" : item.stock === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-pink text-white shadow-pink hover:opacity-90"}`}><ShoppingCart className="w-3.5 h-3.5" />{inCart ? "In cart" : item.stock === 0 ? "Sold out" : "Move to Cart"}</button>
                      <button onClick={() => { removeItem(item.id); toast.success("Removed"); }} className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-400 hover:border-red-300 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
