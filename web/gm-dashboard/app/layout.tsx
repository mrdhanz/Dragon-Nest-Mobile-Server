import type { ReactNode } from "react";

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
      <body>{children}</body>
    </html>
  );
}
