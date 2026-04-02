import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lundy Labs",
  description:
    "Lundy Labs is a think tank building purposeful products, practical experiments, and systems that make the world a little better.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
