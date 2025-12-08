import type { Metadata } from "next";
import "./globals.css";
import { SnowfallBackground } from "@/components/effects/SnowfallBackground";

export const metadata: Metadata = {
  title: "Wichtel App - Anonymes Wichteln leicht gemacht",
  description: "Organisiere dein Wichteln in unter 5 Minuten mit garantierter Anonymität",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <SnowfallBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
