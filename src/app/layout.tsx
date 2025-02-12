import type { Metadata } from "next";

import "./globals.css";


export const metadata: Metadata = {
  title: "Galo das Seis",
  description: "Gerador de postagens para o Instagram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
