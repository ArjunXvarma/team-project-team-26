import NavbarWrapper from "../../components/navbar/navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
