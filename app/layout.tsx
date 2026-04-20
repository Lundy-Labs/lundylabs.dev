import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Nav from "@/components/nav";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Lundy Labs LLC",
  description: "A small think tank building practical tools for everyday decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="/umami/script.js"
            data-website-id="02226505-26bb-4a1d-a7d0-92b23a42d8c5"
            strategy="afterInteractive"
          />
        )}
        <Nav />
        {children}
      </body>
    </html>
  );
}