import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "src/components/bar/Navbar/Navbar";
// import RightSidebar from "@/components/bar/right-side-bar";
import Providers from "src/app/Providers/page";
import Sidebar from "src/components/bar/Sidebar12";


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
        <Providers>
          <Sidebar />
          {children}</Providers>
        {/* <RightSidebar /> */}
      </body>
    </html>
  );
}
