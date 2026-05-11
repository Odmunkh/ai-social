import "./globals.css";
import type { Metadata } from "next";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "AI Social",
  description:
    "AI ашиглан Facebook, Instagram poster болон caption хэдхэн секундэд үүсгээрэй.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>
        {children}

        <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      </body>
    </html>
  );
}
