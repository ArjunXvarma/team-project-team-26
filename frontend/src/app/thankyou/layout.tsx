import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Payment successfully accepted.",
};

export default function ThankYouLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
