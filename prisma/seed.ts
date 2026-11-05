import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 14) throw new Error("Set SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 14 characters.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, isActive: true, role: "SUPER_ADMIN" },
    create: { name: process.env.SEED_ADMIN_NAME || "Jtech Administrator", email: email.toLowerCase(), passwordHash, role: "SUPER_ADMIN" }
  });
  const categories = [
    ["AI & Embedded Systems","ai-embedded-systems"],["Industrial Automation","industrial-automation"],
    ["Robotics","robotics"],["Instrumentation","instrumentation"],["NDT & Process","ndt-process"],
    ["Remote IoT","remote-iot"],["PCB Services","pcb-services"]
  ];
  const ids:Record<string,string>={};
  for (let i=0;i<categories.length;i++) {
    const cat=await prisma.category.upsert({ where:{slug:categories[i][1]}, update:{name:categories[i][0],sortOrder:i}, create:{name:categories[i][0],slug:categories[i][1],sortOrder:i} });
    ids[categories[i][1]]=cat.id;
  }
  const products=[
    ["Explosives Instrumentation","explosives-instrumentation","Instrumentation","Instrumentation and monitoring solutions for approved industrial applications."],
    ["AI Applications & Embedded Systems","ai-embedded-systems","AI & Embedded","Intelligent applications, embedded hardware and connected device development."],
    ["PLC / SCADA Solutions","plc-scada-solutions","Industrial Automation","Industrial control, supervisory monitoring and operator interface solutions."],
    ["Robotic Solutions","robotic-solutions","Robotics","Robotics concepts and integration for industrial automation use cases."],
    ["NDT & Process Applications","ndt-process-applications","NDT & Process","Non-destructive testing-related and industrial process application solutions."],
    ["Remote IoT Solutions","remote-iot-solutions","Remote IoT","Connected monitoring, remote visibility and data-driven operational insights."],
    ["Industrial Automation & Electrical Panels","industrial-automation-panels","Industrial Automation","Industrial automation engineering and electrical panel solutions."],
    ["VFD & PLC PCB Chip-Level Services","vfd-plc-pcb-services","PCB Services","Electronic board inspection, troubleshooting and repair services."]
  ];
  for(let i=0;i<products.length;i++){
    const p=products[i];const category=categories.find(c=>c[0]===p[2]);
    await prisma.product.upsert({where:{slug:p[1]},update:{},create:{title:p[0],slug:p[1],categoryId:category?ids[category[1]]:null,summary:p[3],description:p[3]+" Contact Jtech to confirm the application scope, technical specifications and supported models.",isPublished:false,sortOrder:i}});
  }
  const services=[
    ["System Design & Development","system-design-development","Application discovery, engineering design and product development."],
    ["PLC / SCADA Integration","plc-scada-integration","Industrial control, HMI and supervisory monitoring integration."],
    ["Robotics & Automation","robotics-automation","Application assessment and robotics integration planning."],
    ["IoT & Remote Monitoring","iot-remote-monitoring","Connected devices, data visibility, dashboards and alert workflows."],
    ["NDT & Process Applications","ndt-process-support","Inspection and process application support, subject to confirmed scope."],
    ["VFD / PLC PCB Services","vfd-plc-pcb-services","Board-level diagnostic and repair assessment, subject to supported models."]
  ];
  for(let i=0;i<services.length;i++){
    const s=services[i];const category=categories.find(c=>c[0]===(i===1||i===3?"Industrial Automation":i===2?"Robotics":i===4?"NDT & Process":i===5?"PCB Services":"AI & Embedded Systems"));
    await prisma.service.upsert({where:{slug:s[1]},update:{},create:{title:s[0],slug:s[1],summary:s[2],description:s[2],categoryId:category?ids[category[1]]:null,isPublished:false,sortOrder:i}});
  }
  console.log("Jtech administrator, categories, and unpublished starter catalogue entries are ready.");
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
