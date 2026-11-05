import { NextRequest,NextResponse } from "next/server";
import { getSession,verifySameOrigin } from "@/lib/auth";
import { createUploadUrl } from "@/lib/s3";
export async function POST(req:NextRequest){
 if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await getSession();if(!user||!["SUPER_ADMIN","ADMIN","EDITOR"].includes(user.role))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const {contentType,fileName}=await req.json();const result=await createUploadUrl(contentType,fileName);return NextResponse.json(result);}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Upload could not be initialized."},{status:400});}
}
