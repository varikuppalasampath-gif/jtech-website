"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";

const links = [{label:"Home",href:"/"},{label:"About Us",href:"/about"},{label:"Products",href:"/products",children:true},{label:"Services",href:"/services"},{label:"Industries",href:"/industries"},{label:"Projects",href:"/projects"},{label:"Careers",href:"/careers"},{label:"Contact",href:"/contact"}];

export default function Header() {
  const [open,setOpen] = useState(false);
  return <header className="site-header"><div className="nav-wrap container">
    <Link href="/" className="brand" aria-label="Jtech home"><span className="brand-mark">JTECH<span className="brand-ai">AI</span></span><small>Mechatronics and AI Solutions Pvt Ltd</small></Link>
    <button className="mobile-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">{open?<X/>:<Menu/>}</button>
    <nav className={open?"nav-links open":"nav-links"}>{links.map(l=><Link key={l.href} href={l.href} onClick={()=>setOpen(false)}>{l.label}{l.children&&<ChevronDown size={13}/>}</Link>)}</nav>
    <Link href="/contact?type=Quote" className="button button-small nav-cta">Get a Quote <ArrowUpRight size={15}/></Link>
  </div></header>;
}
