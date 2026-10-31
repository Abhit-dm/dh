import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DH Hospitals API",
  description: "Server-side API for DH Hospitals.",
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
