import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { products as fallbackProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
export const revalidate=60;
export function generateStaticParams(){return fallbackProducts.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=fallbackProducts.find(x=>x.slug===slug);return {title:p?.title??"Solution"};}
export default async function ProductDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;let p:any=fallbackProducts.find(x=>x.slug===slug);
 try{const row=await prisma.product.findFirst({where:{slug,isPublished:true},include:{category:true}});if(row)p={slug:row.slug,title:row.title,category:row.category?.name||"Solutions",summary:row.summary,description:row.description,image:row.imageUrl||p?.image||fallbackProducts[0].image,features:Array.isArray(row.features)?row.features as string[]:[],applications:Array.isArray(row.applications)?row.applications as string[]:[]};}catch(e){console.error("Product detail read failed",e);}
 if(!p)notFound();
 return <><section className="detail-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(5,22,39,.94),rgba(5,22,39,.35)),url("${p.image}")`}}><div className="container"><Link href="/products" className="back-link"><ArrowLeft size={15}/> All solutions</Link><span className="eyebrow eyebrow-light">{p.category}</span><h1>{p.title}</h1><p>{p.summary}</p><Link href={`/contact?type=Product%20Enquiry&category=${encodeURIComponent(p.title)}`} className="button button-cyan">Enquire about this solution <ArrowUpRight size={16}/></Link></div></section><section className="section-pad"><div className="container detail-grid"><div><span className="eyebrow">OVERVIEW</span><h2>Designed around the <em>application.</em></h2><p className="lead">{p.description}</p></div><div className="detail-panel"><h3>Capability highlights</h3>{(p.features||[]).map((x:string)=><p className="check-line" key={x}><CheckCircle2 size={18}/>{x}</p>)}<h3 className="mt-30">Potential applications</h3><div className="tag-list">{(p.applications||[]).map((x:string)=><span key={x}>{x}</span>)}</div><Link href={`/contact?type=Product%20Enquiry&category=${encodeURIComponent(p.title)}`} className="text-link">Discuss your requirement <ArrowUpRight size={16}/></Link></div></div></section><section className="section-pad related-bg"><div className="container"><span className="eyebrow">NEXT STEP</span><h2>Need a solution for your <em>application?</em></h2><p>Share the operating context and technical requirement with Jtech.</p><Link href="/contact" className="button button-dark">Contact Jtech <ArrowUpRight size={16}/></Link></div></section></>
}
