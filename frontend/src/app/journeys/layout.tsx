import NavbarWrapper from "../../components/navbar/navbar";

export default function JourneysLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
