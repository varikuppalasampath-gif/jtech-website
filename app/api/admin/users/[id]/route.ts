import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession,verifySameOrigin } from "@/lib/auth";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const actor=await getSession();if(!actor||actor.role!=="SUPER_ADMIN")return NextResponse.json({error:"Super admin only."},{status:403});
 const {id}=await params;
 const parsed=z.object({name:z.string().min(2).max(100).optional(),role:z.enum(["SUPER_ADMIN","ADMIN","EDITOR","ENQUIRY_MANAGER","VIEWER"]).optional(),isActive:z.boolean().optional(),password:z.string().min(14).max(200).optional()}).safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:"Invalid update."},{status:400});
 if(id===actor.id && parsed.data.isActive===false)return NextResponse.json({error:"You cannot deactivate your own account."},{status:400});
 const {password,...rest}=parsed.data;
 const data={...rest,...(password?{passwordHash:await bcrypt.hash(password,12)}:{})};
 const item=await prisma.adminUser.update({where:{id},data,select:{id:true,name:true,email:true,role:true,isActive:true,createdAt:true}});
 await prisma.auditLog.create({data:{adminUserId:actor.id,action:"UPDATE",entityType:"adminUser",entityId:id}});
 return NextResponse.json({item});
}
