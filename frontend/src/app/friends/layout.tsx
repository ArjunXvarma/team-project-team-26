import { Metadata } from "next";
import NavbarWrapper from "../../components/navbar/navbar";

export const metadata: Metadata = {
  title: "Friends",
  description: "Find and connect with your friends.",
};
export default function FriendsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
