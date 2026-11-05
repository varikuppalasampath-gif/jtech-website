import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata: Metadata = {
 title: { default: "Jtech | Mechatronics & AI Solutions", template: "%s | Jtech" },
 description: "Engineering-led industrial automation, AI, embedded systems, robotics, instrumentation and IoT solutions from Jtech.",
 metadataBase: new URL("https://www.jtech-ai.com")
};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>;
}
