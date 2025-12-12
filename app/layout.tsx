import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import "./globals.css";
import { SnowfallBackground } from "@/components/effects/SnowfallBackground";

export const metadata: Metadata = {
  title: "Wichtel App - Anonymes Wichteln leicht gemacht",
  description: "Organisiere dein Wichteln in unter 5 Minuten mit garantierter Anonymität. WhatsApp-Integration, magische Reveal-Animation und garantierte Anonymität - auch für Organisatoren!",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wichtel App',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load messages for i18n (locale determined by cookie/browser)
  const messages = await getMessages()

  return (
    <html lang="de">
      <body>
        <NextIntlClientProvider messages={messages}>
          <SnowfallBackground />
          <div className="relative z-10">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
