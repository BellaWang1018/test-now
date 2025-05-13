import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicLayout from "./public-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InternHub - Find Your Dream Internship",
  description: "Connect with top companies and discover exciting internship opportunities that match your skills and interests.",
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
