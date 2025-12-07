import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wichtel App - Anonymes Wichteln leicht gemacht",
  description: "Organisiere dein Wichteln in unter 5 Minuten mit garantierter Anonymität",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
