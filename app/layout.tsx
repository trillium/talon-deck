import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talon Deck",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className="dark">
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
