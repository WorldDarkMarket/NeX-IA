import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeX IA - Inteligência Artificial | Powered by IAHub360°",
  description: "NeX IA - Terminal de Inteligência Artificial multi-modelo. Interface avançada para interação com IA em múltiplos modos. Powered by IAHub360°.",
  keywords: ["NeX IA", "Inteligência Artificial", "IA", "AI", "Chat IA", "IAHub360", "Chatbot", "Assistente Virtual"],
  authors: [{ name: "IAHub360°" }],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "NeX IA - Inteligência Artificial",
    description: "Terminal de Inteligência Artificial multi-modelo. Powered by IAHub360°.",
    url: "https://nexia.iahub360.com",
    siteName: "NeX IA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeX IA - Inteligência Artificial",
    description: "Terminal de Inteligência Artificial multi-modelo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sessão anônima é criada automaticamente via middleware

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
