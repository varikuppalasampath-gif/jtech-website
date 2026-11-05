import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession,verifySameOrigin } from "@/lib/auth";
const roles=["SUPER_ADMIN","ADMIN","EDITOR","ENQUIRY_MANAGER","VIEWER"] as const;
export async function GET(){
 const user=await getSession();if(!user||user.role!=="SUPER_ADMIN")return NextResponse.json({error:"Super admin only."},{status:403});
 const items=await prisma.adminUser.findMany({select:{id:true,name:true,email:true,role:true,isActive:true,createdAt:true},orderBy:{createdAt:"desc"}});
 return NextResponse.json({items});
}
export async function POST(req:NextRequest){
 if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const actor=await getSession();if(!actor||actor.role!=="SUPER_ADMIN")return NextResponse.json({error:"Super admin only."},{status:403});
 const parsed=z.object({name:z.string().min(2).max(100),email:z.string().email().max(254),password:z.string().min(14).max(200),role:z.enum(roles)}).safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Invalid user details."},{status:400});
 try{const d=parsed.data;const item=await prisma.adminUser.create({data:{name:d.name,email:d.email.toLowerCase(),passwordHash:await bcrypt.hash(d.password,12),role:d.role},select:{id:true,name:true,email:true,role:true,isActive:true,createdAt:true}});
 await prisma.auditLog.create({data:{adminUserId:actor.id,action:"CREATE",entityType:"adminUser",entityId:item.id}});
 return NextResponse.json({item},{status:201});}catch{return NextResponse.json({error:"Email may already exist."},{status:409});}
}
