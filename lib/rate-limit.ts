import { prisma } from "@/lib/prisma";
export async function checkRateLimit(key:string,limit:number,windowMs:number) {
  const now=new Date();
  const current=await prisma.rateLimitBucket.findUnique({where:{key}});
  if(!current || now.getTime()-current.windowStart.getTime()>windowMs) {
    await prisma.rateLimitBucket.upsert({where:{key},create:{key,attempts:1,windowStart:now},update:{attempts:1,windowStart:now}});
    return {allowed:true,remaining:limit-1};
  }
  if(current.attempts>=limit)return {allowed:false,remaining:0,retryAfterMs:windowMs-(now.getTime()-current.windowStart.getTime())};
  await prisma.rateLimitBucket.update({where:{key},data:{attempts:{increment:1}}});
  return {allowed:true,remaining:Math.max(0,limit-current.attempts-1)};
}
export async function resetRateLimit(key:string) {
  await prisma.rateLimitBucket.upsert({where:{key},create:{key,attempts:0},update:{attempts:0,windowStart:new Date()}});
}
