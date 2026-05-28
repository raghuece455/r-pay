import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "R-Pay | Raghu's Pay",
  description: "Fictional UPI-style payment simulation and IncidentDesk"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

