import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
export default function ProductCard({product}:{product:Product}) {
 return <Link href={`/products/${product.slug}`} className="product-card">
  <div className="product-image" style={{backgroundImage:`url("${product.image}")`}}><span className="product-icon">{product.icon}</span></div>
  <div className="product-card-body"><span className="eyebrow">{product.category}</span><h3>{product.title}</h3><p>{product.summary}</p><span className="text-link">Explore solution <ArrowUpRight size={15}/></span></div>
 </Link>
}
