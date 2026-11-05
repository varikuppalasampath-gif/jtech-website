import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { createSession, verifySameOrigin } from "@/lib/auth";
const schema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(200)});
export async function POST(req:NextRequest) {
  if (!verifySameOrigin(req)) return NextResponse.json({error:"Invalid request origin."},{status:403});
  try {
    const parsed=schema.safeParse(await req.json());
    if(!parsed.success)return NextResponse.json({error:"Enter a valid email and password."},{status:400});
    const email=parsed.data.email.toLowerCase();
    const ip=(req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"unknown").split(",")[0].trim();
    const bucket=`login:${createHash("sha256").update(ip).digest("hex")}`;
    const rate=await checkRateLimit(bucket,8,15*60*1000);
    if(!rate.allowed)return NextResponse.json({error:"Too many login attempts. Try again in 15 minutes."},{status:429});
    const user=await prisma.adminUser.findUnique({where:{email}});
    const valid=user && user.isActive ? await bcrypt.compare(parsed.data.password,user.passwordHash) : false;
    if(!valid) return NextResponse.json({error:"Invalid credentials."},{status:401});
    await resetRateLimit(bucket);
    await createSession({id:user.id,email:user.email,role:user.role});
    await prisma.auditLog.create({data:{adminUserId:user.id,action:"LOGIN",entityType:"AUTH"}});
    return NextResponse.json({ok:true,user:{name:user.name,email:user.email,role:user.role}});
  } catch { return NextResponse.json({error:"Authentication service unavailable."},{status:500}); }
}
