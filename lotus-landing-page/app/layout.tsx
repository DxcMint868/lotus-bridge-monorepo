import type { Metadata } from "next";
import "../styles/globals.css";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Lotus Bridge - Built by Vietnam, Connecting the World",
  description: "The first blockchain bridge built by Vietnam. Experience seamless multi-chain connectivity with special support for Vietnamese tokens.",
  generator: "Lotus Bridge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
