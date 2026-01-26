import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Infiheal Video Chat",
  description: "Secure P2P Video Chat for Therapy",
};

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} animated-bg min-h-screen text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground pt-24`}>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
