import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership",
  description: "Buy membership for your account.",
};

export default function MembershipLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
