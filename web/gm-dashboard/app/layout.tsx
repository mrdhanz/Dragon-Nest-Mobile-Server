import type { ReactNode } from "react";
import Layout from "../components/Layout";
import "./globals.css";

export const metadata = {
  title: "GM Dashboard",
  description: "Admin dashboard for Dragon Nest Mobile"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
