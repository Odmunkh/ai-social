import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV Forge",
  description: "AI Resume Builder in Mongolian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
