import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helium — Find Your Next Home",
  description:
    "Explore listings, save favorites, and book visits with Helium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
