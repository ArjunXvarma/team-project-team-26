import { Metadata } from "next";
import NavbarWrapper from "../../components/navbar/navbar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your dashboard to get insights into your journeys.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
