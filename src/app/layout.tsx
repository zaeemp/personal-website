import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zaeem Patel",
  description: "Personal website of Zaeem Patel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <div className="mx-auto max-w-2xl px-6">
          <Header />
          <main className="min-h-[calc(100vh-10rem)]">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
