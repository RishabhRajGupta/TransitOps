import "./globals.css";
import React from "react";
import { AuthProvider } from "../components/providers/auth-provider";
import { QueryProvider } from "../components/providers/query-provider";

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
          <QueryProvider>
            <main>{children}</main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
