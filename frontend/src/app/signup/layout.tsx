import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup",
  description: "Signup and join Fit Fusion Today!",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
