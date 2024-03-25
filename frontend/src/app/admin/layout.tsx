import AdminNavbar from "../../components/admin-navbar";

export default function JourneysLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminNavbar>{children}</AdminNavbar>;
}
