import Navbar from "../../components/navbar";

export default function JourneysLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Navbar>{children}</Navbar>;
}
