import type { Metadata } from "next";
import { Fredoka, Nunito, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";
import { Toaster } from "sonner";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuestLearn - Learn Through Adventure",
  description: "Gamified learning platform for K-12 education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${nunito.variable} ${merriweather.variable} font-nunito antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
