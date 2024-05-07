import NavbarWrapper from "../../components/navbar/navbar";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
