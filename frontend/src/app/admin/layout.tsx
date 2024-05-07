import AdminNavbarWrapper from "../../components/admin-navbar";

export default function JourneysLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminNavbarWrapper>{children}</AdminNavbarWrapper>;
}
