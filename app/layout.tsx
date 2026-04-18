import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Nav from "@/components/nav";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Lundy Labs LLC",
  description: "A small think tank for practical ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="02226505-26bb-4a1d-a7d0-92b23a42d8c5"></script>
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
