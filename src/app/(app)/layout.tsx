import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/bar/Navbar";
// import RightSidebar from "@/components/bar/right-side-bar";
import Providers from "@/app/Providers/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduConnect",
  description: "A platform for students and teachers to connect",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />

        <Providers>{children}</Providers>
        {/* <RightSidebar /> */}
      </body>
    </html>
  );
}
