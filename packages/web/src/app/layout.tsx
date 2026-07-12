import "./globals.css";
import React from "react";
import { AuthProvider } from "../components/providers/auth-provider";

export const metadata = {
  title: "TransitOps",
  description: "Fleet Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
