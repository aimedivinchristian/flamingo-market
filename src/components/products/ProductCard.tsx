"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export interface ProductType {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  stock: number;
  isFeatured?: boolean;
  isNew?: boolean;
  badge?: string;
  seller: { name: string };
  store?: { id?: string; name: string } | null;
  category: { name: string };
  rating?: number;
  reviews?: number;
}

function getBg(cat: string) {
  const map: Record<string, string> = {
    fashion:     "from-pink-pale to-pink-pale2",
    beauty:      "from-purple-50 to-pink-50",
    electronics: "from-blue-50 to-cyan-light",
    home:        "from-amber-50 to-orange-50",
    supermarket: "from-green-50 to-emerald-50",
    accessories: "from-yellow-50 to-amber-50",
    detergents:  "from-sky-50 to-blue-50",
    local:       "from-orange-50 to-yellow-50",
  };
  return map[cat.toLowerCase()] || "from-gray-50 to-gray-100";
}

export function ProductCard({ product }: { product: ProductType }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded]           = useState(false);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const storeName = product.store?.name || product.seller.name;

  function handleCart(e: React.MouseEvent) {
    e.preventDefault();
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleWish(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted(w => !w);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-white border-[1.5px] border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-pink-pale2 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)]">

        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getBg(product.category.name)} flex items-center justify-center`}>
              <ShoppingCart className="w-16 h-16 text-gray-200" strokeWidth={0.8} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap z-10">
            {product.isFeatured && <span className="badge-feat">Featured</span>}
            {discount        && <span className="badge-sale">-{discount}%</span>}
            {product.isNew   && !product.isFeatured && <span className="badge-new">New</span>}
            {product.badge === "hot" && !product.isFeatured && <span className="badge-hot">Hot</span>}
            {product.stock === 0 && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWish}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white rounded-full border-[1.5px] border-gray-200 flex items-center justify-center shadow transition-all hover:border-pink hover:scale-110"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${wishlisted ? "text-pink fill-pink" : "text-gray-400"}`}
            />
          </button>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 gap-2">
            <button
              onClick={handleCart}
              disabled={product.stock === 0}
              className={`flex-1 py-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                added
                  ? "bg-green-500 text-white"
                  : product.stock === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-pink text-white hover:bg-pink-light shadow-pink"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {added ? "Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={e => e.preventDefault()}
              className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:text-cyan transition-colors shadow"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <div className="text-[11px] text-gray-400 font-medium mb-0.5 truncate">{storeName}</div>
          <div className="text-[13.5px] font-bold text-gray-800 mb-2 leading-snug line-clamp-2 group-hover:text-pink transition-colors">
            {product.name}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-pink font-extrabold text-[15px]">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-gray-300 text-[11.5px] line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11.5px] text-gray-400">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{product.rating ?? "4.8"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
