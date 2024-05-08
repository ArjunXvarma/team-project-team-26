import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout with your chosen membership.",
};

export default function PaymentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
