import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
export const metadata:Metadata={title:"Careers"};
export default function Careers(){return <><section className="page-hero"><div className="container"><span className="eyebrow eyebrow-light">CAREERS AT JTECH</span><h1>Build what's <em>next.</em></h1><p>Interested in engineering, automation, embedded technology and intelligent systems?</p></div></section><section className="section-pad"><div className="container empty-state"><BriefcaseBusiness/><h2>Opportunities at Jtech</h2><p>Current openings will be listed here when approved by the company. To share your profile, contact the team.</p><a href="mailto:info@jtech-ai.com?subject=Career%20Enquiry" className="button button-dark">Send your profile <ArrowUpRight size={16}/></a></div></section></>}
