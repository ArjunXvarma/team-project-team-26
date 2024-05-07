import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login with your username and password",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
