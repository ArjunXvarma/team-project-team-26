import { Metadata } from "next";
import NavbarWrapper from "../../components/navbar/navbar";

export const metadata: Metadata = {
  title: "Settings",
  description: "Customise your experience by personalising the settings.",
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavbarWrapper>{children}</NavbarWrapper>;
}
