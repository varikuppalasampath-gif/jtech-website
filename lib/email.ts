import { Resend } from "resend";
export async function sendEnquiryEmails(input: {
  referenceNo: string; name: string; email: string; phone: string;
  company?: string; enquiryType: string; category?: string; subject: string; message: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.ENQUIRY_TO_EMAIL) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "Jtech Website <onboarding@resend.dev>";
  await resend.emails.send({
    from, to: process.env.ENQUIRY_TO_EMAIL,
    subject: `[${input.referenceNo}] ${input.enquiryType}: ${input.subject}`,
    text: `New website enquiry\n\nReference: ${input.referenceNo}\nName: ${input.name}\nCompany: ${input.company || "-"}\nEmail: ${input.email}\nPhone: ${input.phone}\nType: ${input.enquiryType}\nCategory: ${input.category || "-"}\nSubject: ${input.subject}\n\n${input.message}`
  });
  await resend.emails.send({
    from, to: input.email,
    subject: `Jtech has received your enquiry (${input.referenceNo})`,
    text: `Hello ${input.name},\n\nThank you for contacting Jtech Mechatronics and AI Solutions Pvt. Ltd. We have received your enquiry. Your reference number is ${input.referenceNo}.\n\nOur team will review your message and contact you using the details provided.\n\nRegards,\nJtech Team`
  });
}
