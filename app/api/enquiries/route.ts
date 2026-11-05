import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, verifySameOrigin } from "@/lib/auth";
import { sendEnquiryEmails } from "@/lib/email";
import { createHash } from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";
const schema=z.object({
 name:z.string().trim().min(2).max(100), company:z.string().trim().max(120).optional().default(""),
 email:z.string().trim().email().max(254), phone:z.string().trim().min(7).max(20),
 enquiryType:z.string().trim().min(2).max(60), category:z.string().trim().max(120).optional().default(""),
 subject:z.string().trim().min(2).max(160), message:z.string().trim().min(10).max(5000), consent:z.literal(true)
});
export async function POST(req:NextRequest) {
  if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
  try {
    const ip=(req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"unknown").split(",")[0].trim();
    const bucket=`enquiry:${createHash("sha256").update(ip).digest("hex")}`;
    const rate=await checkRateLimit(bucket,5,10*60*1000);
    if(!rate.allowed)return NextResponse.json({error:"Too many enquiries from this connection. Please try again later."},{status:429});
    const parsed=schema.safeParse(await req.json());
    if(!parsed.success)return NextResponse.json({error:"Please check the required fields."},{status:400});
    const d=parsed.data; const referenceNo=`JTECH-${Date.now().toString().slice(-8)}`;
    const item=await prisma.enquiry.create({data:{referenceNo,name:d.name,company:d.company,email:d.email,phone:d.phone,enquiryType:d.enquiryType,category:d.category,subject:d.subject,message:d.message}});
    try { await sendEnquiryEmails({...d,referenceNo}); } catch(e) { console.error("Enquiry email delivery failed",e); }
    return NextResponse.json({ok:true,referenceNo:item.referenceNo},{status:201});
  } catch(e) { console.error("Enquiry submission failed",e); return NextResponse.json({error:"Unable to submit enquiry."},{status:500}); }
}
export async function GET(req:NextRequest) {
  const user=await getSession(); if(!user || !["SUPER_ADMIN","ADMIN","ENQUIRY_MANAGER"].includes(user.role))return NextResponse.json({error:"Unauthorized"},{status:401});
  const {searchParams}=new URL(req.url);const status=searchParams.get("status");const q=searchParams.get("q");
  const items=await prisma.enquiry.findMany({where:{...(status&&status!=="ALL"?{status}:{}),...(q?{OR:[{name:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{referenceNo:{contains:q,mode:"insensitive"}},{subject:{contains:q,mode:"insensitive"}}]}:{})},orderBy:{createdAt:"desc"},take:200});
  return NextResponse.json({items});
}
