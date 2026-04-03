import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Car Lease Contracts",
  description: "Send and sign car lease contracts with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
