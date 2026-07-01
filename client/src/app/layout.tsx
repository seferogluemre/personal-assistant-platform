import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenClaw AI",
  description: "Yapay Zeka Destekli Asistan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                animationDuration: "300ms",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
