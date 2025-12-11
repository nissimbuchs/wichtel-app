import type { Metadata } from "next";
import "./globals.css";
import { SnowfallBackground } from "@/components/effects/SnowfallBackground";

export const metadata: Metadata = {
  title: "Wichtel App - Anonymes Wichteln leicht gemacht",
  description: "Organisiere dein Wichteln in unter 5 Minuten mit garantierter Anonymität. WhatsApp-Integration, magische Reveal-Animation und garantierte Anonymität - auch für Organisatoren!",
  viewport: "width=device-width, initial-scale=1",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wichtel App',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
