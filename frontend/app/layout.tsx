import type { Metadata } from "next";
import { Inter, Merriweather, Fredoka, Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({ 
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const fredoka = Fredoka({ 
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const nunito = Nunito({ 
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "QuestLearn - AI-Powered Gamified Learning",
  description: "Transform your curriculum into engaging quest-based learning adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`
        ${inter.variable} 
        ${merriweather.variable} 
        ${fredoka.variable} 
        ${nunito.variable} 
        ${jetbrainsMono.variable}
        font-inter
      `}>
        {children}
      </body>
    </html>
  );
}
