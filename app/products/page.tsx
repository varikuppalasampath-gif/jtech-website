import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products as fallbackProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
export const metadata:Metadata={title:"Products & Solutions"};
export const revalidate=60;
export default async function ProductsPage(){
 let items:any[]=fallbackProducts;
 try{const rows=await prisma.product.findMany({where:{isPublished:true},include:{category:true},orderBy:{sortOrder:"asc"}});if(rows.length)items=rows.map(p=>({slug:p.slug,title:p.title,category:p.category?.name||"Solutions",summary:p.summary,description:p.description,icon:"◈",image:p.imageUrl||fallbackProducts.find(x=>x.slug===p.slug)?.image||fallbackProducts[0].image,features:Array.isArray(p.features)?p.features as string[]:[],applications:Array.isArray(p.applications)?p.applications as string[]:[]}));}catch(e){console.error("Catalogue database read failed; showing preview catalogue.",e);}
 return <><section className="page-hero"><div className="container"><span className="eyebrow eyebrow-light">JTECH CAPABILITIES</span><h1>Products & <em>solutions.</em></h1><p>Explore our technology and engineering capabilities across industrial applications.</p></div></section><section className="section-pad"><div className="container"><div className="catalogue-intro"><p className="lead">A connected portfolio of engineering capabilities — shaped around your application and project requirements.</p><span>{items.length.toString().padStart(2,"0")} CATEGORIES</span></div><div className="product-grid">{items.map(p=><ProductCard key={p.slug} product={p}/>)}</div><p className="disclaimer">Product and service descriptions are indicative. Confirm availability, specifications, supported models and scope with Jtech before making a purchase or technical decision.</p></div></section></>}
