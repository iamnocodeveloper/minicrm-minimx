import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiniCRM AI — CRM moderno para quem vende de verdade",
  description:
    "MiniCRM AI: pipeline Kanban, dashboard, atividades, tarefas e recursos de IA para gestão de leads e clientes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "hsl(240 8% 9%)",
              border: "1px solid hsl(240 6% 18%)",
              color: "hsl(240 12% 96%)",
            },
          }}
        />
      </body>
    </html>
  );
}
