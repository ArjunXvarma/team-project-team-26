import { Metadata } from "next";
import NavbarWrapper from "../../components/navbar/navbar";

export const metadata: Metadata = {
  title: "Journey",
  description: "Get insights into your journeys.",
};

export default function JourneysLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
