import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Infiheal Video Chat",
  description: "Secure P2P Video Chat for Therapy",
};

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} animated-bg min-h-screen text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 pt-24`}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
