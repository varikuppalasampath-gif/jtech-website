import { NextRequest, NextResponse } from "next/server";
import { destroySession, verifySameOrigin } from "@/lib/auth";
export async function POST(req:NextRequest) {
  if(!verifySameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
  await destroySession();
  return NextResponse.json({ok:true});
}
