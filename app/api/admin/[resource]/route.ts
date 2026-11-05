import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, verifySameOrigin } from "@/lib/auth";
const resources=["products","services","projects","categories"] as const;
type Resource=typeof resources[number];
const productSchema=z.object({title:z.string().min(2).max(160),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),summary:z.string().min(5).max(500),description:z.string().min(10),categoryId:z.string().optional().nullable(),imageUrl:z.string().url().optional().or(z.literal("")),isPublished:z.boolean().default(false),sortOrder:z.number().int().default(0),features:z.array(z.string()).optional(),applications:z.array(z.string()).optional(),datasheetUrl:z.string().url().optional().or(z.literal(""))});
const serviceSchema=productSchema.omit({features:true,applications:true,datasheetUrl:true});
const projectSchema=z.object({title:z.string().min(2).max(160),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),industry:z.string().optional(),summary:z.string().min(5).max(500),challenge:z.string().min(10),solution:z.string().min(10),outcome:z.string().optional(),imageUrl:z.string().url().optional().or(z.literal("")),isPublished:z.boolean().default(false)});
const categorySchema=z.object({name:z.string().min(2).max(100),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),description:z.string().optional(),sortOrder:z.number().int().default(0),isActive:z.boolean().default(true)});
async function authorize(req:NextRequest,write=false){
 const user=await getSession();if(!user)return null;
 if(write&&!["SUPER_ADMIN","ADMIN","EDITOR"].includes(user.role))return null;
 return user;
}
export async function GET(req:NextRequest,{params}:{params:Promise<{resource:string}>}){
 const user=await authorize(req);if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {resource}=await params;if(!resources.includes(resource as Resource))return NextResponse.json({error:"Unknown resource"},{status:404});
 const r=resource as Resource;
 if(r==="products")return NextResponse.json({items:await prisma.product.findMany({include:{category:true},orderBy:{sortOrder:"asc"}})});
 if(r==="services")return NextResponse.json({items:await prisma.service.findMany({include:{category:true},orderBy:{sortOrder:"asc"}})});
 if(r==="projects")return NextResponse.json({items:await prisma.project.findMany({orderBy:{createdAt:"desc"}})});
 return NextResponse.json({items:await prisma.category.findMany({orderBy:{sortOrder:"asc"}})});
}
export async function POST(req:NextRequest,{params}:{params:Promise<{resource:string}>}){
 if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await authorize(req,true);if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {resource}=await params;if(!resources.includes(resource as Resource))return NextResponse.json({error:"Unknown resource"},{status:404});
 try{
  const body=await req.json();let created;
  if(resource==="products"){const d=productSchema.parse(body);created=await prisma.product.create({data:{...d,imageUrl:d.imageUrl||null,datasheetUrl:d.datasheetUrl||null,categoryId:d.categoryId||null}});}
  else if(resource==="services"){const d=serviceSchema.parse(body);created=await prisma.service.create({data:{...d,imageUrl:d.imageUrl||null,categoryId:d.categoryId||null}});}
  else if(resource==="projects"){const d=projectSchema.parse(body);created=await prisma.project.create({data:{...d,imageUrl:d.imageUrl||null}});}
  else {const d=categorySchema.parse(body);created=await prisma.category.create({data:d});}
  await prisma.auditLog.create({data:{adminUserId:user.id,action:"CREATE",entityType:resource,entityId:(created as {id:string}).id}});
  return NextResponse.json({item:created},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof z.ZodError?e.issues[0]?.message:"Could not create item. Check for duplicate slug."},{status:400});}
}
export async function PATCH(req:NextRequest,{params}:{params:Promise<{resource:string}>}){
 if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await authorize(req,true);if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {resource}=await params;if(!resources.includes(resource as Resource))return NextResponse.json({error:"Unknown resource"},{status:404});
 try{
  const body=await req.json();const id=z.string().min(1).parse(body.id);const data=body.data;
  let item;
  if(resource==="products"){const d=productSchema.partial().parse(data);item=await prisma.product.update({where:{id},data:{...d,categoryId:d.categoryId||null,imageUrl:d.imageUrl||null,datasheetUrl:d.datasheetUrl||null}});}
  else if(resource==="services"){const d=serviceSchema.partial().parse(data);item=await prisma.service.update({where:{id},data:{...d,categoryId:d.categoryId||null,imageUrl:d.imageUrl||null}});}
  else if(resource==="projects"){const d=projectSchema.partial().parse(data);item=await prisma.project.update({where:{id},data:{...d,imageUrl:d.imageUrl||null}});}
  else {const d=categorySchema.partial().parse(data);item=await prisma.category.update({where:{id},data:d});}
  await prisma.auditLog.create({data:{adminUserId:user.id,action:"UPDATE",entityType:resource,entityId:id}});
  return NextResponse.json({item});
 }catch(e){return NextResponse.json({error:e instanceof z.ZodError?e.issues[0]?.message:"Could not update item."},{status:400});}
}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{resource:string}>}){
 if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await authorize(req,true);if(!user || !["SUPER_ADMIN","ADMIN"].includes(user.role))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {resource}=await params;if(!resources.includes(resource as Resource))return NextResponse.json({error:"Unknown resource"},{status:404});
 try{const id=new URL(req.url).searchParams.get("id");if(!id)return NextResponse.json({error:"Missing id"},{status:400});
  if(resource==="products")await prisma.product.delete({where:{id}});
  if(resource==="services")await prisma.service.delete({where:{id}});
  if(resource==="projects")await prisma.project.delete({where:{id}});
  if(resource==="categories")await prisma.category.delete({where:{id}});
  await prisma.auditLog.create({data:{adminUserId:user.id,action:"DELETE",entityType:resource,entityId:id}});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Could not delete item. It may be in use."},{status:400});}
}
