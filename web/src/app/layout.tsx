import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";
import Navbar from "@/components/custom/nav/Navbar";

export const metadata: Metadata = {
  title: "Atelier",
  description: "Personal E-Commerce Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          <Navbar />
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}