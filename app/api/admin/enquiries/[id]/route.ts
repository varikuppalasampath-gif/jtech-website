import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession,verifySameOrigin } from "@/lib/auth";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await getSession();if(!user||!["SUPER_ADMIN","ADMIN","ENQUIRY_MANAGER"].includes(user.role))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;const parsed=z.object({status:z.enum(["NEW","IN_REVIEW","CONTACTED","QUOTATION_SENT","CLOSED","SPAM"]).optional(),adminNotes:z.string().max(5000).optional()}).safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:"Invalid update"},{status:400});
 const item=await prisma.enquiry.update({where:{id},data:parsed.data});
 await prisma.auditLog.create({data:{adminUserId:user.id,action:"UPDATE",entityType:"enquiry",entityId:id}});
 return NextResponse.json({item});
}
