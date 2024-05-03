import NavbarWrapper from "../../components/navbar/navbar";

export default function FriendsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
