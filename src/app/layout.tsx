import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicLayout from "./public-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "First Interns - Find Your Dream Internship",
  description: "Connect with top companies and find your perfect internship opportunity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PublicLayout>
          {children}
        </PublicLayout>
      </body>
    </html>
  );
}
